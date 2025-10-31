import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import { GlobalValidationPipe } from 'libs/pipes/src/global-validation.pipe';
import { ResponseInterceptor } from '@app/interceptors';
import { GlobalExceptionFilter } from '@app/filters';

type CorsCallback = (err: Error | null, allow?: boolean) => void;

interface CorsOptions {
  origin: (origin: string | undefined, callback: CorsCallback) => void;
  credentials: boolean;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(new GlobalValidationPipe());

  const allowedOrigins =
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [];

  app.enableCors(<CorsOptions>{
    origin: (origin: string | undefined, callback: CorsCallback): void => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed.'));
      }
    },
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Sipradi PVBU Backend')
    .setDescription('The Sipradi PVBU Backend API description')
    .setVersion('0.1')
    .addTag('Sipradi PVBU Backend')
    .addBearerAuth()
    .build();

  const documentFactory = (): OpenAPIObject => {
    return SwaggerModule.createDocument(app, config);
  };
  SwaggerModule.setup('swagger/api', app, documentFactory);

  const PORT = process.env.PORT;
  await app.listen(PORT, () => {
    Logger.log(
      `
--------------------------------------------------------------
--------------------------------------------------------------
      App running on:   http://localhost:${PORT}
      API Docs on:      http://localhost:${PORT}/swagger/api
--------------------------------------------------------------
--------------------------------------------------------------
      `,
    );
  });
}

bootstrap();
