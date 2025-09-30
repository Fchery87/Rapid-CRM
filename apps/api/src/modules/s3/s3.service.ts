import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || "us-east-1";
    const accessKeyId = required("S3_ACCESS_KEY", process.env.S3_ACCESS_KEY);
    const secretAccessKey = required("S3_SECRET_KEY", process.env.S3_SECRET_KEY);
    this.bucket = required("S3_BUCKET", process.env.S3_BUCKET);

    this.client = new S3Client({
      region,
      forcePathStyle: true,
      endpoint,
      credentials: { accessKeyId, secretAccessKey }
    });
  }

  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async presignPut(objectKey: string, contentType: string, expiresSeconds = 300): Promise<string> {
    await this.ensureBucket();
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: contentType
    });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresSeconds });
  }

  async presignGet(objectKey: string, expiresSeconds = 300): Promise<string> {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey
    });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresSeconds });
  }

  async putObject(objectKey: string, body: Uint8Array | Buffer, contentType = "application/octet-stream") {
    await this.ensureBucket();
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: body,
        ContentType: contentType
      })
    );
    return { key: objectKey };
  }
}