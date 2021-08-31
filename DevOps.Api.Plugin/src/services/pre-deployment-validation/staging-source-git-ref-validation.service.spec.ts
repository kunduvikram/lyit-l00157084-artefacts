import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { StagingSourceGitRefValidation } from './staging-source-git-ref-validation.service';
import { invalidSourceGitRefForEnvironment } from '../../common/messages';
import { constants } from '../../common/pipeline-utils';

describe('STAGING source branch validation', () => {
  let validation: StagingSourceGitRefValidation;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DevOpsApiModule],
    }).compile();

    validation = module.get(StagingSourceGitRefValidation.name);
  });

  it(`should throw an HttpException when the release source GitRef is not a hotfix`, async () => {
    expect.assertions(1);
    const sourceGitRef = 'AnyBranch';
    try {
      await validation.validate({
        artifacts: [
          {
            isPrimary: true,
            definitionReference: {
              branch: {
                name: sourceGitRef,
              },
            },
          },
        ],
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(
          invalidSourceGitRefForEnvironment(
            sourceGitRef,
            constants.environments.STAGING,
            StagingSourceGitRefValidation.allowedGitRefTypes,
          ),
          500,
        ),
      );
    }
  });

  it(`should not throw any exception when the release source branch is a hotfix GitRef type`, async () => {
    const sourceGitRef = 'hotfix/RCC-123';
    await validation.validate({
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: sourceGitRef,
            },
          },
        },
      ],
    });
  });
});
