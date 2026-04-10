"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const common_1 = require("@nestjs/common");
let StorageService = StorageService_1 = class StorageService {
    logger = new common_1.Logger(StorageService_1.name);
    bucket = process.env.S3_BUCKET?.trim() || 'product-images';
    endpoint = process.env.S3_ENDPOINT?.trim();
    region = process.env.S3_REGION?.trim() || 'us-east-1';
    accessKey = process.env.S3_ACCESS_KEY?.trim();
    secretKey = process.env.S3_SECRET_KEY?.trim();
    publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
    forcePathStyle = (process.env.S3_FORCE_PATH_STYLE ?? 'true').toLowerCase() !== 'false';
    fallbackObjects = new Map();
    verifiedBuckets = new Set();
    client;
    constructor() {
        if (this.endpoint && this.accessKey && this.secretKey) {
            this.client = new client_s3_1.S3Client({
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
        this.logger.warn('S3 storage credentials are incomplete. Falling back to in-memory media storage for this runtime.');
    }
    getDefaultBucket() {
        return this.bucket;
    }
    isUsingFallback() {
        return !this.client;
    }
    async uploadObject(input) {
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
            await this.client.send(new client_s3_1.PutObjectCommand({
                Bucket: input.bucket,
                Key: input.key,
                Body: input.body,
                ContentType: input.contentType,
                ContentLength: input.contentLength,
            }));
            return {
                bucket: input.bucket,
                key: input.key,
                url: this.getPublicUrl(input.bucket, input.key),
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload object to bucket \`${input.bucket}\` with key \`${input.key}\`: ${error instanceof Error ? error.message : 'unknown error'}`);
            throw new common_1.ServiceUnavailableException('Product media storage is temporarily unavailable.');
        }
    }
    async deleteObject(input) {
        if (!this.client) {
            this.fallbackObjects.delete(this.getFallbackMapKey(input.bucket, input.key));
            return;
        }
        try {
            await this.client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: input.bucket,
                Key: input.key,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to delete object from bucket \`${input.bucket}\` with key \`${input.key}\`: ${error instanceof Error ? error.message : 'unknown error'}`);
            throw new common_1.ServiceUnavailableException('Product media storage is temporarily unavailable.');
        }
    }
    getPublicUrl(bucket, key) {
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
    async ensureBucketExists(bucket) {
        if (!this.client || this.verifiedBuckets.has(bucket)) {
            return;
        }
        try {
            await this.client.send(new client_s3_1.HeadBucketCommand({
                Bucket: bucket,
            }));
            this.verifiedBuckets.add(bucket);
            return;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            this.logger.warn(`Storage bucket \`${bucket}\` was not ready during head check. Attempting creation: ${message}`);
        }
        try {
            await this.client.send(new client_s3_1.CreateBucketCommand({
                Bucket: bucket,
            }));
            this.logger.log(`Created storage bucket \`${bucket}\` for local media uploads.`);
            this.verifiedBuckets.add(bucket);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error';
            if (/already exists|bucketalreadyownedbyyou|bucketalreadyexists/i.test(message)) {
                this.verifiedBuckets.add(bucket);
                return;
            }
            this.logger.error(`Failed to create storage bucket \`${bucket}\`: ${message}`);
            throw new common_1.ServiceUnavailableException('Product media storage is temporarily unavailable.');
        }
    }
    getFallbackMapKey(bucket, key) {
        return `${bucket}:${key}`;
    }
    trimTrailingSlash(value) {
        return value.replace(/\/+$/, '');
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map