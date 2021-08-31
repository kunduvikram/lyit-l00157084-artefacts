import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { SourceGitRefPendingPullRequestsValidation } from './source-git-ref-pending-pull-requests-validation.service';
import { WebApi } from 'azure-devops-node-api';
import { constants, gitRefName } from '../../common/pipeline-utils';
import { sourceGitRefHasPendingPullRequests } from '../../common/messages';

describe('Pending pull requests validation', () => {
  let validation: SourceGitRefPendingPullRequestsValidation;
  const azureDevOpsApi = {
    getGitApi: () => null,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DevOpsApiModule],
    })
      .overrideProvider(WebApi)
      .useValue(azureDevOpsApi)
      .compile();

    validation = module.get(SourceGitRefPendingPullRequestsValidation.name);
  });

  it(`should throw an HttpException when the release source branch has pending pull requests`, async () => {
    expect.assertions(1);

    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getPullRequests: async (): Promise<any> => {
          return Promise.resolve([{}]);
        },
      });
    });

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
    };

    const sourceGitRef = gitRefName(release);

    try {
      await validation.validate(release);
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(
          sourceGitRefHasPendingPullRequests(sourceGitRef, [{}]),
          500,
        ),
      );
    }
  });

  it(`should not throw any exception when the release source branch hasn't pending pull requests`, async () => {
    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getPullRequests: async (): Promise<any> => {
          return Promise.resolve([]);
        },
      });
    });

    const sourceBranch = constants.git.refs.DEVELOP;
    await validation.validate({
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: sourceBranch,
            },
            repository: {
              id: '1b19e4d2-c039-44b6-a122-60c8087280f5',
            },
          },
        },
      ],
    });
  });
});
