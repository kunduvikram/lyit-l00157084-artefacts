import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { WebApi } from 'azure-devops-node-api';
import { constants, gitRefName } from '../../common/pipeline-utils';
import { GitRefCommitsBehindMasterValidation } from './git-ref-commits-behind-master-validation.service';
import { sourceGitRefHasCommitsBehindMaster } from '../../common/messages';

describe('Validate source GitRef commits behind the master branch', () => {
  let validation: GitRefCommitsBehindMasterValidation;
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

    validation = module.get(GitRefCommitsBehindMasterValidation.name);
  });

  it(`should throw an HttpException when the source GitRef develop has commits behind the master branch`, async () => {
    expect.assertions(1);

    const behindCount = 1;

    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getCommitDiffs: async (): Promise<any> => {
          return Promise.resolve({
            behindCount,
          });
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
      projectReference: {
        name: 'Rare-Carat',
      },
    };

    const sourceGitRef = gitRefName(release);

    try {
      await validation.validate(release);
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(
          sourceGitRefHasCommitsBehindMaster(sourceGitRef, behindCount),
          500,
        ),
      );
    }
  });

  it(`should throw an HttpException when the source GitRef hotfix has commits behind the master branch`, async () => {
    expect.assertions(1);

    const behindCount = 1;

    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getBranch: async (): Promise<any> => {
          return Promise.resolve({
            behindCount,
          });
        },
        getCommitDiffs: async (): Promise<any> => {
          return Promise.resolve({
            behindCount,
          });
        },
      });
    });

    const release = {
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: constants.git.refs.HOTFIX_PREFIX + '123',
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

    const sourceGitRef = gitRefName(release);
    try {
      await validation.validate(release);
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(
          sourceGitRefHasCommitsBehindMaster(sourceGitRef, behindCount),
          500,
        ),
      );
    }
  });

  it(`should not throw any HttpException when the source GitRef hotfix has no commits behind the master`, async () => {
    const behindCount = 0;

    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getBranch: async (): Promise<any> => {
          return Promise.resolve({
            behindCount,
          });
        },
        getCommitDiffs: async (): Promise<any> => {
          return Promise.resolve({
            behindCount,
          });
        },
      });
    });

    await validation.validate({
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: constants.git.refs.HOTFIX_PREFIX + '123',
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
    });
  });

  it(`should not throw any HttpException when the develop source branch has no commits behind the master`, async () => {
    const behindCount = 0;

    jest.spyOn(azureDevOpsApi, 'getGitApi').mockImplementation(() => {
      return Promise.resolve({
        getCommitDiffs: async (): Promise<any> => {
          return Promise.resolve({
            behindCount,
          });
        },
        getBranch: async (): Promise<any> => {
          return Promise.resolve({
            behindCount,
          });
        },
      });
    });

    await validation.validate({
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
    });
  });
});
