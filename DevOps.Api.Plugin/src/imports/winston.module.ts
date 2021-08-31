import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export default WinstonModule.forRoot({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'devops-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});
