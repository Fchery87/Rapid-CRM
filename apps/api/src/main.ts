import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${process.env.PORT || 4000}`);
}
bootstrap();