import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { setupFirebase } from './config/firebase-config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  setupFirebase(configService);
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('hbs');

  // --- Configuration Swagger ---
  const config = new DocumentBuilder()
    .setTitle('FitMe API')
    .setDescription(
      "Documentation de l'API FitMe - Application de fitness basée sur le cycle menstruel",
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentification et gestion des utilisateurs')
    .addTag('Status', "Statut de l'application")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // === GÉNÉRATION DYNAMIQUE DU FICHIER OPENAPI.JSON ===
  // Export du fichier JSON pour Docusaurus
  const openApiJsonPath = join(__dirname, '..', 'openapi.json');
  fs.writeFileSync(openApiJsonPath, JSON.stringify(document, null, 2));
  console.log(`✅ Fichier OpenAPI généré: ${openApiJsonPath}`);

  // Route pour servir le JSON en temps réel (optionnel, pour la doc dynamique)
  app.getHttpAdapter().get('/api-json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(document);
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  console.log(`📖 Swagger UI available at: ${await app.getUrl()}/api-docs`);
  console.log(`📄 OpenAPI JSON available at: ${await app.getUrl()}/api-json`);
}
bootstrap();
