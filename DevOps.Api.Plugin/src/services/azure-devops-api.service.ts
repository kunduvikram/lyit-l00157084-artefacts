import * as azureDevOps from 'azure-devops-node-api';
import { ConfigService } from 'nestjs-config';
import { WebApi } from 'azure-devops-node-api';

export default {
  provide: WebApi,
  useFactory: (configService: ConfigService): WebApi => {
    const token: string = configService.get('azure.token');
    const authHandler = azureDevOps.getPersonalAccessTokenHandler(token);
    return new azureDevOps.WebApi(
      configService.get('azure.defaultUrl'),
      authHandler,
    );
  },
  inject: [ConfigService],
};
