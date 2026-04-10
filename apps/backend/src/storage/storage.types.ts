export interface StorageUploadInput {
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
  contentLength?: number;
}

export interface StorageDeleteInput {
  bucket: string;
  key: string;
}

export interface StorageObjectResult {
  bucket: string;
  key: string;
  url: string;
}
