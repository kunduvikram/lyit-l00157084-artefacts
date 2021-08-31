import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { QASourceGitRefBranchValidation } from './qa-source-git-ref-validation.service';
import { invalidSourceGitRefForEnvironment } from '../../common/messages';
import { constants, gitRefName } from '../../common/pipeline-utils';

describe('QA source branch validation', () => {
  let validation: QASourceGitRefBranchValidation;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DevOpsApiModule],
    }).compile();

    validation = module.get(QASourceGitRefBranchValidation.name);
  });

  it(`should throw an HttpException when the release source GitRef type is not a hotfix, feature or develop`, async () => {
    expect.assertions(1);
    const sourceGitRef = 'InvalidGitRef';
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
            constants.environments.QA,
            QASourceGitRefBranchValidation.allowedGitRefTypes,
          ),
          500,
        ),
      );
    }
  });

  it(`should not throw any exception when the release source GitRef type is a hotfix `, async () => {
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

  it(`should not throw any exception when the release source GitRef type is a develop`, async () => {
    const sourceGitRef = 'develop';
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

  it(`should not throw any exception when the release source GitRef type is a feature`, async () => {
    const sourceGitRef = 'feature/RCC-123';
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
