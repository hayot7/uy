export interface StorageConfig {
  provider: 'local' | 's3';
  localUploadsPath?: string;
  s3?: {
    bucket: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

const storage: StorageConfig = {
  provider: process.env.STORAGE_PROVIDER === 's3' ? 's3' : 'local',
  localUploadsPath: process.env.LOCAL_UPLOADS_PATH || 'uploads',
  s3: {
    bucket: process.env.S3_BUCKET || '',
    region: process.env.S3_REGION || '',
    accessKeyId: process.env.S3_KEY || '',
    secretAccessKey: process.env.S3_SECRET || ''
  }
};

export default storage;