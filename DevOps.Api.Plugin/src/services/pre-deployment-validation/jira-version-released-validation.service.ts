import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PreDeploymentValidation } from '../../interfaces';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import JiraClient from 'jira-connector';
import { releaseVersionVariableValue } from '../../common/pipeline-utils';
import { ConfigService } from 'nestjs-config';
import { TypeTokens } from '../../common/type-tokens';
import {
  jiraReleaseHasNoIssuesFixed,
  jiraReleaseHasNotBeenCreated,
  jiraVersionHasNotBeenReleased,
} from '../../common/messages';

@Injectable()
export class JiraVersionReleasedValidation implements PreDeploymentValidation {
  @Inject(TypeTokens.JiraApi) private readonly jiraClient: JiraClient;
  @Inject(ConfigService) private readonly config: ConfigService;

  async validate(release: Release): Promise<any> {
    const versions = await this.jiraClient.project.getVersions({
      projectIdOrKey: this.config.get('jira.projectIdOrKey'),
    });
    const releaseVersion = releaseVersionVariableValue(release);
    const jiraRelease =
      releaseVersion && versions.find(v => v.name === releaseVersion);

    if (!jiraRelease) {
      throw new HttpException(
        jiraReleaseHasNotBeenCreated(releaseVersion),
        500,
      );
    }

    if (
      jiraRelease.issuesStatusForFixVersion &&
      jiraRelease.issuesStatusForFixVersion.done === 0
    ) {
      throw new HttpException(jiraReleaseHasNoIssuesFixed(releaseVersion), 500);
    }

    if (jiraRelease.released === false) {
      throw new HttpException(
        jiraVersionHasNotBeenReleased(releaseVersion),
        500,
      );
    }
  }
}
