import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../s3/s3.service";
import crypto from "node:crypto";

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  private randomKey(ext: string): string {
    const id = crypto.randomBytes(16).toString("hex");
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `uploads/${date}/${id}${ext ? `.${ext}` : ""}`;
  }

  async signUpload(params: { accountName: string; filename: string; contentType: string; size: number }) {
    const { accountName, filename, contentType, size } = params;
    const ext = filename.includes(".") ? filename.split(".").pop() : "";
    const key = this.randomKey(ext || "");
    const account = await this.prisma.account.upsert({
      where: { name: accountName },
      create: { name: accountName },
      update: {}
    });
    const url = await this.s3.presignPut(key, contentType);

    await this.prisma.upload.create({
      data: {
        accountId: account.id,
        objectKey: key,
        originalName: filename,
        contentType,
        size
      }
    });

    return { url, key, accountId: account.id };
  }

  async listUploadsByAccount(accountId: string) {
    const uploads = await this.prisma.upload.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" }
    });
    const items = await Promise.all(
      uploads.map(async (u) => ({
        id: u.id,
        objectKey: u.objectKey,
        originalName: u.originalName,
        size: u.size,
        contentType: u.contentType,
        createdAt: u.createdAt,
        downloadUrl: await this.s3.presignGet(u.objectKey)
      }))
    );
    return items;
  }
}