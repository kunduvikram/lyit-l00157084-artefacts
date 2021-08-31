import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { WebApi } from 'azure-devops-node-api';
import { CompletePullRequestAction } from './complete-pull-request-action.service';

describe('Complete pull requests approved to the target branch', () => {
  let action: CompletePullRequestAction;
  const azureDevOpsApi = {
    getGitApi: () => null,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DevOpsApiModule],
    })
      .overrideProvider(WebApi)
      .useValue(azureDevOpsApi)
      .compile();

    action = module.get(CompletePullRequestAction.name);
  });

  it(``, async () => {});
});
