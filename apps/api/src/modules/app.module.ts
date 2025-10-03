import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
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
import { AuditController } from "./audit/audit.controller";
import { AuditService } from "./audit/audit.service";
import { ReportsController } from "./reports/reports.controller";
import { PdfController } from "./pdf/pdf.controller";
import { PdfWorker } from "./pdf/pdf.worker";
import { PdfJobsController } from "./pdf/pdfjobs.controller";
import { AuthService } from "./auth/auth.service";
import { JwtStrategy } from "./auth/jwt.strategy";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-secret",
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    })
  ],
  controllers: [HealthController, AuthController, UploadsController, AccountsController, MetricsController, AuditController, ReportsController, PdfController, PdfJobsController],
  providers: [PrismaService, UploadsService, S3Service, IngestionService, MetricsService, AuditService, PdfWorker, AuthService, JwtStrategy]
})
export class AppModule {}