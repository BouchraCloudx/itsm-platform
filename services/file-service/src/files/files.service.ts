import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import axios from 'axios';

@Injectable()
export class FilesService {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.s3 = new S3Client({
      endpoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, ticketId: string, userId: string) {
    const key = `${ticketId}/${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    await this.registerAttachment(ticketId, key, file.originalname, userId);

    return { key, fileName: file.originalname };
  }

  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  private async registerAttachment(ticketId: string, fileUrl: string, fileName: string, uploadedBy: string) {
    try {
      const ticketServiceUrl = this.configService.get<string>('TICKET_SERVICE_URL');
      await axios.post(`${ticketServiceUrl}/tickets/${ticketId}/attachments/internal`, {
        fileUrl,
        fileName,
        uploadedBy,
      });
    } catch (error) {
      console.error('Échec de l enregistrement de la pièce jointe:', error.message);
    }
  }
}
