import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { PrismaService } from "./prisma/prisma.service";
import { AuthController } from "./auth/auth.controller";
import { UploadsController } from "./uploads/uploads.controller";
import { UploadsService } from "./uploads/uploads.service";
import { S3Service } from "./s3/s3.service";
import { AccountsController } from "./accounts/accounts.controller";

@Module({
  imports: [],
  controllers: [HealthController, AuthController, UploadsController, AccountsController],
  providers: [PrismaService, UploadsService, S3Service]
})
export class AppModule {}