import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { PrismaService } from "./prisma/prisma.service";
import { AuthController } from "./auth/auth.controller";

@Module({
  imports: [],
  controllers: [HealthController, AuthController],
  providers: [PrismaService]
})
export class AppModule {}