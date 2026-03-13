export interface UploadedFile {
  key: string;
  bucket: string;
  location: string;
  size: number;
  mimetype: string;
  originalname: string;
}
