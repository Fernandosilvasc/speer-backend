import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './commons/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();
  const port = configService.get('port');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => console.log(`Running on port: ${port}`));
}
bootstrap();
