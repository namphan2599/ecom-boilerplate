import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { StorageDeleteInput, StorageObjectResult, StorageUploadInput } from './storage.types';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.S3_BUCKET?.trim() || 'product-images';
  private readonly endpoint = process.env.S3_ENDPOINT?.trim();
  private readonly region = process.env.S3_REGION?.trim() || 'us-east-1';
  private readonly accessKey = process.env.S3_ACCESS_KEY?.trim();
  private readonly secretKey = process.env.S3_SECRET_KEY?.trim();
  private readonly publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
  private readonly forcePathStyle =
    (process.env.S3_FORCE_PATH_STYLE ?? 'true').toLowerCase() !== 'false';

  private readonly fallbackObjects = new Map<string, Buffer>();
  private readonly verifiedBuckets = new Set<string>();
  private readonly client?: S3Client;

  constructor() {
    if (this.endpoint && this.accessKey && this.secretKey) {
      this.client = new S3Client({
        region: this.region,
        endpoint: this.endpoint,
        forcePathStyle: this.forcePathStyle,
        credentials: {
          accessKeyId: this.accessKey,
          secretAccessKey: this.secretKey,
        },
      });
      return;
    }

    this.logger.warn(
      'S3 storage credentials are incomplete. Falling back to in-memory media storage for this runtime.',
    );
  }

  getDefaultBucket(): string {
    return this.bucket;
  }

  isUsingFallback(): boolean {
    return !this.client;
  }

  async uploadObject(input: StorageUploadInput): Promise<StorageObjectResult> {
    if (!this.client) {
      this.fallbackObjects.set(this.getFallbackMapKey(input.bucket, input.key), input.body);
      return {
        bucket: input.bucket,
        key: input.key,
        url: this.getPublicUrl(input.bucket, input.key),
      };
    }

    try {
      await this.ensureBucketExists(input.bucket);

      await this.client.send(
        new PutObjectCommand({
          Bucket: input.bucket,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
          ContentLength: input.contentLength,
        }),
      );

      return {
        bucket: input.bucket,
        key: input.key,
        url: this.getPublicUrl(input.bucket, input.key),
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload object to bucket \`${input.bucket}\` with key \`${input.key}\`: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw new ServiceUnavailableException(
        'Product media storage is temporarily unavailable.',
      );
    }
  }

  async deleteObject(input: StorageDeleteInput): Promise<void> {
    if (!this.client) {
      this.fallbackObjects.delete(this.getFallbackMapKey(input.bucket, input.key));
      return;
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: input.bucket,
          Key: input.key,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete object from bucket \`${input.bucket}\` with key \`${input.key}\`: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw new ServiceUnavailableException(
        'Product media storage is temporarily unavailable.',
      );
    }
  }

  getPublicUrl(bucket: string, key: string): string {
    const normalizedKey = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    if (this.publicBaseUrl) {
      return `${this.trimTrailingSlash(this.publicBaseUrl)}/${normalizedKey}`;
    }

    if (this.endpoint) {
      const endpoint = this.trimTrailingSlash(this.endpoint);

      if (this.forcePathStyle) {
        return `${endpoint}/${encodeURIComponent(bucket)}/${normalizedKey}`;
      }

      const parsed = new URL(endpoint);
      return `${parsed.protocol}//${encodeURIComponent(bucket)}.${parsed.host}/${normalizedKey}`;
    }

    return `https://rustfs.local/${encodeURIComponent(bucket)}/${normalizedKey}`;
  }

  private async ensureBucketExists(bucket: string): Promise<void> {
    if (!this.client || this.verifiedBuckets.has(bucket)) {
      return;
    }

    try {
      await this.client.send(
        new HeadBucketCommand({
          Bucket: bucket,
        }),
      );
      this.verifiedBuckets.add(bucket);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(
        `Storage bucket \`${bucket}\` was not ready during head check. Attempting creation: ${message}`,
      );
    }

    try {
      await this.client.send(
        new CreateBucketCommand({
          Bucket: bucket,
        }),
      );
      this.logger.log(`Created storage bucket \`${bucket}\` for local media uploads.`);
      this.verifiedBuckets.add(bucket);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';

      if (/already exists|bucketalreadyownedbyyou|bucketalreadyexists/i.test(message)) {
        this.verifiedBuckets.add(bucket);
        return;
      }

      this.logger.error(
        `Failed to create storage bucket \`${bucket}\`: ${message}`,
      );
      throw new ServiceUnavailableException(
        'Product media storage is temporarily unavailable.',
      );
    }
  }

  private getFallbackMapKey(bucket: string, key: string): string {
    return `${bucket}:${key}`;
  }

  private trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
  }
}
