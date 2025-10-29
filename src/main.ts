import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000, () => {
    console.log('App starting on http://localhost:3000');
  });
}

bootstrap();
