import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { ReleaseNamingValidation } from './release-naming-validation.service';
import { HttpException } from '@nestjs/common';
import {
  hotfixIncrementMinorVersionRequired,
  releaseSemanticVersionRequired,
  releaseVersionIncrementRequired,
  releaseVersionNotProvidedOrEmpty,
} from '../../common/messages';
import { TypeTokens } from '../../common/type-tokens';
import semver = require('semver');
import { constants } from '../../common/pipeline-utils';

describe('Release version naming conventions', () => {
  let validation: ReleaseNamingValidation;
  const jiraClient = {
    project: {
      getVersions: () => null,
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DevOpsApiModule],
    })
      .overrideProvider(TypeTokens.JiraApi)
      .useValue(jiraClient)
      .compile();

    validation = module.get(ReleaseNamingValidation.name);
  });

  it(`should throw an HttpException when release version is not provided`, async () => {
    expect.assertions(1);
    try {
      await validation.validate({ variables: {} });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(releaseVersionNotProvidedOrEmpty(), 500),
      );
    }
  });

  it(`should throw an HttpException when release version is empty`, async () => {
    expect.assertions(1);
    try {
      await validation.validate({
        variables: { ReleaseVersion: { value: '' } },
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(releaseVersionNotProvidedOrEmpty(), 500),
      );
    }
  });

  it(`should throw an HttpException when release version doesn't follow the semantic version standard`, async () => {
    expect.assertions(1);
    const releaseVersion = 'non-semver-release';
    try {
      await validation.validate({
        variables: { ReleaseVersion: { value: releaseVersion } },
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(releaseSemanticVersionRequired(releaseVersion), 500),
      );
    }
  });

  it(`should throw an HttpException when the release version is not an incrementing the latest version for any GitRef.`, async () => {
    expect.assertions(1);

    const versions = [
      {
        name: '1.0.1',
        released: true,
      },
      {
        name: '1.0.2',
        released: true,
      },
    ];

    jest
      .spyOn(jiraClient.project, 'getVersions')
      .mockImplementation(() => Promise.resolve(versions));

    const releaseVersion = '1.0.0';
    try {
      await validation.validate({
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
        variables: { ReleaseVersion: { value: releaseVersion } },
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(
          releaseVersionIncrementRequired(releaseVersion, '1.0.2'),
          500,
        ),
      );
    }
  });

  it(`should not throw any exception when release version follows the semantic version standard`, async () => {
    jest
      .spyOn(jiraClient.project, 'getVersions')
      .mockImplementation(() => Promise.resolve([]));
    const releaseVersion = '1.0.0';
    await validation.validate({
      variables: { ReleaseVersion: { value: releaseVersion } },
    });
  });

  it(`should throw an HttpException when a release branch is hotfix GitRef and doesn't increment the patch version.`, async () => {
    expect.assertions(1);

    const versions = [
      {
        name: '1.0.1',
        released: true,
      },
      {
        name: '1.0.2',
        released: true,
      },
    ];

    jest
      .spyOn(jiraClient.project, 'getVersions')
      .mockImplementation(() => Promise.resolve(versions));

    const releaseVersion = '1.0.2';
    try {
      await validation.validate({
        artifacts: [
          {
            isPrimary: true,
            definitionReference: {
              branch: {
                name: constants.git.refs.HOTFIX_PREFIX + '123',
              },
            },
          },
        ],
        variables: { ReleaseVersion: { value: releaseVersion } },
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(
          hotfixIncrementMinorVersionRequired(releaseVersion, '1.0.2', '1.0.3'),
          500,
        ),
      );
    }
  });

  it(`should not throw any exception when a release branch is hotfix GitRef, the candidate release version is 1.0.1 and the latest released version is 1.0.0`, async () => {
    const versions = [
      {
        name: '0.0.1',
        released: true,
      },
      {
        name: '1.0.0',
        released: true,
      },
    ];

    jest
      .spyOn(jiraClient.project, 'getVersions')
      .mockImplementation(() => Promise.resolve(versions));

    const releaseVersion = '1.0.1';
    await validation.validate({
      artifacts: [
        {
          isPrimary: true,
          definitionReference: {
            branch: {
              name: constants.git.refs.HOTFIX_PREFIX + '123',
            },
          },
        },
      ],
      variables: { ReleaseVersion: { value: releaseVersion } },
    });
  });
});
