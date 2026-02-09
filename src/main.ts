import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TypedConfigService } from './config/typed-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.disable('x-powered-by');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = app.get(TypedConfigService);

  const port = config.get('PORT');
  const baseUrl = config.get('BASE_URL').replace(/\/+$/, '');
  const swaggerEnabled = config.get('SWAGGER_ENABLED');
  const swaggerPath = config.get('SWAGGER_PATH').replace(/^\/+/, '');

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('URL Shortener API')
      .setDescription('REST API for URL shortening with JWT authentication.')
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document);

    logger.log(`Swagger available at ${baseUrl}/${swaggerPath}`);
  }

  await app.listen(port);
  logger.log(`API running on ${baseUrl}`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
