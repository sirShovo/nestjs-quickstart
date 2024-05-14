import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthCheckResource {
  constructor(private readonly health: HealthCheckService, private readonly mongoose: MongooseHealthIndicator) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([async () => this.mongoose.pingCheck('mongo')]);
  }
}
