import { Test } from '@nestjs/testing';
import { DevOpsApiModule } from '../../devops-api.module';
import { HttpException } from '@nestjs/common';
import { JiraReleaseCreatedValidation } from './jira-release-created-validation.service';
import { TypeTokens } from '../../common/type-tokens';
import {
  jiraReleaseHasNotBeenCreated,
  jiraReleaseWasAlreadyReleased,
} from '../../common/messages';

describe('Jira release created validation', () => {
  let validation: JiraReleaseCreatedValidation;
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

    validation = module.get(JiraReleaseCreatedValidation.name);
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

  it(`should throw an HttpException when the release has already been release in JIRA`, async () => {
    expect.assertions(1);

    const releaseVersion = '10.0.0';

    jest.spyOn(jiraClient.project, 'getVersions').mockImplementation(() =>
      Promise.resolve([
        {
          name: releaseVersion,
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
        new HttpException(jiraReleaseWasAlreadyReleased(releaseVersion), 500),
      );
    }
  });

  it(`should not throw any error when the release has created and unreleased in JIRA`, async () => {
    const releaseVersion = '10.0.0';

    jest.spyOn(jiraClient.project, 'getVersions').mockImplementation(() =>
      Promise.resolve([
        {
          name: releaseVersion,
          released: false,
        },
      ]),
    );

    await validation.validate({
      variables: {
        ReleaseVersion: { value: releaseVersion },
      },
    });
  });
});
