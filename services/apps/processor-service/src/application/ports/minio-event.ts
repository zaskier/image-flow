export type MinioEvent = {
  Records: Array<{
    s3: {
      bucket: { name: string };
      object: { key: string };
    };
  }>;
};
