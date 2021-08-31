import { ConfigService } from 'nestjs-config';
const JiraClient = require('jira-connector');
import { TypeTokens } from '../common/type-tokens';

export default {
  provide: TypeTokens.JiraApi,
  useFactory: (configService: ConfigService) => {
    return new JiraClient(configService.get('jira'));
  },
  inject: [ConfigService],
};
