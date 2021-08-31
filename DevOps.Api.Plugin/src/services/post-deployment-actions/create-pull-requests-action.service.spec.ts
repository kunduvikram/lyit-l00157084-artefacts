import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { WebApi } from 'azure-devops-node-api';
import { CreatePullRequestsAction } from './create-pull-requests-action.service';
import { constants } from '../../common/pipeline-utils';

describe('Create pull requests as a post-deployment action', () => {
  let action: CreatePullRequestsAction;
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

    action = module.get(CreatePullRequestsAction.name);
  });

  it(`should throw an HttpException when the source GitRef develop has commits behind the master branch`, async () => {
    const release = {
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: constants.git.refs.DEVELOP,
            },
            repository: {
              id: '1b19e4d2-c039-44b6-a122-60c8087280f5',
            },
          },
        },
      ],
      projectReference: {
        name: 'Rare-Carat',
      },
    };

    //
    // const sourceGitRef = gitRefName(release);
    //
    // try {
    //   await action.execute(release);
    // } catch (e) {
    //   expect(e).toMatchObject(new HttpException(`Error creating pull requests.`, 500));
    // }
  });
});
