import { StorageDeleteInput, StorageObjectResult, StorageUploadInput } from './storage.types';
export declare class StorageService {
    private readonly logger;
    private readonly bucket;
    private readonly endpoint;
    private readonly region;
    private readonly accessKey;
    private readonly secretKey;
    private readonly publicBaseUrl;
    private readonly forcePathStyle;
    private readonly fallbackObjects;
    private readonly verifiedBuckets;
    private readonly client?;
    constructor();
    getDefaultBucket(): string;
    isUsingFallback(): boolean;
    uploadObject(input: StorageUploadInput): Promise<StorageObjectResult>;
    deleteObject(input: StorageDeleteInput): Promise<void>;
    getPublicUrl(bucket: string, key: string): string;
    private ensureBucketExists;
    private getFallbackMapKey;
    private trimTrailingSlash;
}
