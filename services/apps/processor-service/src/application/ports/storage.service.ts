export interface StorageService {
  download(bucket: string, key: string): Promise<Buffer>;
  upload(bucket: string, key: string, buffer: Buffer, contentType?: string): Promise<void>;
}

export const StorageServiceToken = Symbol("StorageService");
