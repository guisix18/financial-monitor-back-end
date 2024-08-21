import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.getOrThrow('AWS_S3_SECRET_KEY'),
    },
  });

  constructor(private readonly configService: ConfigService) {}

  async uploadReport(filename: string, file: Buffer) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.getOrThrow('AWS_S3_BUCKET'),
        Key: filename,
        Body: file,
        ContentType: 'application/zip',
        ContentDisposition: `attachment; filename="${filename}"`,
      }),
    );
  }

  async getFile(filename: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.configService.getOrThrow('AWS_S3_BUCKET'),
      Key: filename,
    });

    const { Body } = await this.s3Client.send(command);

    const chunks: Uint8Array[] = [];
    for await (const chunk of Body as Readable) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async deleteFile(filename: string): Promise<void> {
    const bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: filename,
    });

    await this.s3Client.send(command);
  }
}
