import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { JiraVersionReleasedValidation } from './jira-version-released-validation.service';
import { TypeTokens } from '../../common/type-tokens';
import {
  jiraReleaseHasNoIssuesFixed,
  jiraReleaseHasNotBeenCreated,
  jiraVersionHasNotBeenReleased,
} from '../../common/messages';

describe('Jira version released validation', () => {
  let validation: JiraVersionReleasedValidation;
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

    validation = module.get(JiraVersionReleasedValidation.name);
  });

  it(`should throw an HttpException when the release has not been created in JIRA`, async () => {
    expect.assertions(1);

    jest
      .spyOn(jiraClient.project, 'getVersions')
      .mockImplementation(() => Promise.resolve([]));

    const releaseVersion = '10.0.0';
    try {
      await validation.validate({
        variables: {
          ReleaseVersion: { value: releaseVersion },
        },
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(jiraReleaseHasNotBeenCreated(releaseVersion), 500),
      );
    }
  });

  it(`should throw an HttpException when the version has not been released in JIRA`, async () => {
    expect.assertions(1);

    const releaseVersion = '10.0.0';

    jest.spyOn(jiraClient.project, 'getVersions').mockImplementation(() =>
      Promise.resolve([
        {
          name: releaseVersion,
          released: false,
        },
      ]),
    );

    try {
      await validation.validate({
        variables: {
          ReleaseVersion: { value: releaseVersion },
        },
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(jiraVersionHasNotBeenReleased(releaseVersion), 500),
      );
    }
  });

  it(`should throw an HttpException when the release has no issues fixed`, async () => {
    expect.assertions(1);

    const releaseVersion = '10.0.0';

    jest.spyOn(jiraClient.project, 'getVersions').mockImplementation(() =>
      Promise.resolve([
        {
          name: releaseVersion,
          issuesStatusForFixVersion: {
            done: 0,
          },
          released: true,
        },
      ]),
    );

    try {
      await validation.validate({
        variables: {
          ReleaseVersion: { value: releaseVersion },
        },
      });
    } catch (e) {
      expect(e).toMatchObject(
        new HttpException(jiraReleaseHasNoIssuesFixed(releaseVersion), 500),
      );
    }
  });
});
