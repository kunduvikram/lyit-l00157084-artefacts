import { Module } from '@nestjs/common';
import { Imports } from './imports';
import Controllers from './controllers';
import Providers from './services';

@Module({
  imports: [...Imports],
  controllers: [...Controllers],
  providers: [...Providers],
})
export class DevOpsApiModule {}
