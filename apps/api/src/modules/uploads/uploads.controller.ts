import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { UploadsService } from "./uploads.service";

type SignUploadDto = {
  accountName: string;
  filename: string;
  contentType: string;
  size: number;
};

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

  @Get("account/:accountId")
  async list(@Param("accountId") accountId: string) {
    return this.uploads.listUploadsByAccount(accountId);
  }
}