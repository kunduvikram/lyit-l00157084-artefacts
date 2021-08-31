import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { WebApi } from 'azure-devops-node-api';
import { constants, gitRefName } from '../../common/pipeline-utils';
import { targetPullRequestsApprovalRequired } from '../../common/messages';
import { CodeReviewApprovedValidation } from './pending-approval-target-pull-requests.service';

describe('Validate pending pull requests with pending approval from the release source the master branch', () => {
  let validation: CodeReviewApprovedValidation;
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

    validation = module.get(CodeReviewApprovedValidation.name);
  });

  it(`should throw an HttpException when the release source has pending approval pull requests to the master branch `, async () => {
    expect.assertions(1);

    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getPullRequests: async (): Promise<any> => {
          return Promise.resolve([
            {
              reviewers: [{ vote: 10 }, { vote: -10 }],
            },
          ]);
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
          targetPullRequestsApprovalRequired(
            sourceGitRef,
            [{}],
            constants.git.refs.MASTER,
          ),
          500,
        ),
      );
    }
  });

  it(`should not throw any when the release source hasn't pending approval pull requests to the master branch `, async () => {
    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getPullRequests: async (): Promise<any> => {
          return Promise.resolve([
            {
              reviewers: [{ vote: 10 }],
            },
          ]);
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
    await validation.validate(release);
  });
});
