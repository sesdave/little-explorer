// apps/api/src/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;
  private region: string;

  constructor(private config: ConfigService) {
    this.region = this.config.getOrThrow<string>('AWS_REGION');
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');

    const accessKeyId = this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID').trim();
    const secretAccessKey = this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY').trim();
    console.log('AWS_ACCESS_KEY_ID:', accessKeyId);
    console.log('AWS_SECRET_ACCESS_KEY length:', secretAccessKey.length);

    this.client = new S3Client({
      region: this.region.trim(),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, parentId: string): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const key = `children/${parentId}/${Date.now()}.${fileExtension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Using a cleaner URL construction to avoid the TS error
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}