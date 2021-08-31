import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { ProductionSourceGitRefValidation } from './production-source-git-ref-validation.service';
import { constants, gitRefName } from '../../common/pipeline-utils';
import { invalidSourceGitRefForEnvironment } from '../../common/messages';

describe('Production source branch validation', () => {
  let validation: ProductionSourceGitRefValidation;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DevOpsApiModule],
    }).compile();

    validation = module.get(ProductionSourceGitRefValidation.name);
  });

  it(`should throw an HttpException when the release source branch other branch than the hotfix or develop`, async () => {
    expect.assertions(1);
    const release = {
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: 'AnyBranch',
            },
          },
        },
      ],
    };
    try {
      await validation.validate(release);
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(
          invalidSourceGitRefForEnvironment(
            gitRefName(release),
            constants.environments.PRODUCTION,
            ProductionSourceGitRefValidation.allowedGitRefTypes,
          ),
          500,
        ),
      );
    }
  });

  it(`should not throw any exception when the release source branch is a hotfix branch`, async () => {
    const sourceBranch = 'hotfix/RCC-123';
    await validation.validate({
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: sourceBranch,
            },
          },
        },
      ],
    });
  });

  it(`should not throw any exception when the release source branch is a develop branch`, async () => {
    const sourceBranch = 'develop';
    await validation.validate({
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: sourceBranch,
            },
          },
        },
      ],
    });
  });
});
