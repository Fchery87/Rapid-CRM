import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { MetricsService } from "./modules/metrics/metrics.service";
import { HttpMetricsInterceptor } from "./modules/metrics/http-metrics.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  // attach HTTP metrics interceptor
  const metrics = app.get(MetricsService);
  app.useGlobalInterceptors(new HttpMetricsInterceptor(metrics));

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${process.env.PORT || 4000}`);
}
bootstrap();