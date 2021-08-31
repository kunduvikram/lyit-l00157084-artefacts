import { ConfigModule } from 'nestjs-config';

export default ConfigModule.resolveRootPath(__dirname).load(
  'config/**/!(*.d).{ts,js}',
);
