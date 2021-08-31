import { NestFactory } from '@nestjs/core';
import { DevOpsApiModule } from './devops-api.module';

(async function bootstrap() {
  const app = await NestFactory.create(DevOpsApiModule);
  await app.listen(8080);
})();
