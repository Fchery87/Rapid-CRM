import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { PrismaService } from "./prisma/prisma.service";
import { AuthController } from "./auth/auth.controller";
import { UploadsController } from "./uploads/uploads.controller";
import { UploadsService } from "./uploads/uploads.service";
import { S3Service } from "./s3/s3.service";
import { AccountsController } from "./accounts/accounts.controller";
import { IngestionService } from "./ingestion/ingestion.service";
import { MetricsService } from "./metrics/metrics.service";
import { MetricsController } from "./metrics/metrics.controller";

@Module({
  imports: [],
  controllers: [HealthController, AuthController, UploadsController, AccountsController, MetricsController],
  providers: [PrismaService, UploadsService, S3Service, IngestionService, MetricsService]
})
export class AppModule {}