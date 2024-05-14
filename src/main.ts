import { AppConfig, ENVIROMENTS } from '@/app/common';
import { ClusterService, GlobalExceptionFilters, GlobalInterceptors, setRequestIdMiddleware } from '@/infra/common';
import { AppModule } from '@/infra/di';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { PubSubServer } from '@softrizon/gcp-pubsub';
import { default as compression } from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfig);
  const { config } = appConfig;
  app.useLogger(config.app.logger);

  app.useGlobalFilters(...GlobalExceptionFilters.map((filter) => app.get(filter)));

  app.use(setRequestIdMiddleware);

  app.use(compression());
  app.useGlobalInterceptors(...GlobalInterceptors.map((interceptor) => app.get(interceptor)));
  app.setGlobalPrefix(config.server.prefix);

  app.connectMicroservice<MicroserviceOptions>({
    strategy: new PubSubServer(config.pubsub),
  });
  app.startAllMicroservices();

  await app.listen(config.server.port);
  appConfig.printUsage();
}

ClusterService.clusterize(bootstrap, ENVIROMENTS.PROD);
