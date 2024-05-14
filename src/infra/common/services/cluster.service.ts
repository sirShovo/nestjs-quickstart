import cluster, { Worker } from 'node:cluster';

import { ENVIROMENTS } from '@/app/common';
import { Logger } from '@nestjs/common';
import { cpus } from 'os';

export class ClusterService {
  private static readonly logger = new Logger(ClusterService.name);
  static clusterize(callback: () => void, ...onlyOnEnv: ENVIROMENTS[]): void {
    const env = <ENVIROMENTS>process.env.NODE_ENV;
    if (!onlyOnEnv.includes(env)) return callback();

    if (cluster.isPrimary) {
      this.logger.log(`Primary process (${process.pid}) is running...`);

      const cpusCount = cpus().length;
      const workersPlural = cpusCount === 1 ? 'worker' : 'workers';

      this.logger.log(`Forking into ${cpusCount} ${workersPlural}`);
      for (let i = 0; i < cpusCount; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker: Worker) => {
        this.logger.log(`worker ${worker.process.pid} died`);
      });
    } else {
      callback();
    }
  }
}
