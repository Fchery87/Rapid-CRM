import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { UploadsService } from "./uploads.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

type SignUploadDto = {
  accountName: string;
  filename: string;
  contentType: string;
  size: number;
};

type ConfirmUploadDto = {
  objectKey: string;
};

@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post("sign")
  @HttpCode(200)
  async sign(@Body() body: SignUploadDto) {
    // Basic server-side validation
    if (!body.filename || !body.contentType || !body.accountName) {
      throw new Error("Missing fields");
    }
    if (body.size > 10 * 1024 * 1024) {
      throw new Error("File too large");
    }
    return this.uploads.signUpload(body);
  }

  @Post("confirm")
  @HttpCode(200)
  async confirm(@Body() body: ConfirmUploadDto) {
    if (!body.objectKey) throw new Error("Missing objectKey");
    return this.uploads.confirmUpload(body.objectKey);
  }

  @Get("account/:accountId")
  async list(@Param("accountId") accountId: string) {
    return this.uploads.listUploadsByAccount(accountId);
  }
}