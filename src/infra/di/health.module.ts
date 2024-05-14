import { HealthCheckResource } from '@/infra/adapters';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckResource],
})
export class HealthModule {}
