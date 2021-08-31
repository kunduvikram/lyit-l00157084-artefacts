import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PreDeploymentValidation } from '../../interfaces';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import JiraClient from 'jira-connector';
import { releaseVersionVariableValue } from '../../common/pipeline-utils';
import { ConfigService } from 'nestjs-config';
import { TypeTokens } from '../../common/type-tokens';
import {
  jiraReleaseHasNotBeenCreated,
  jiraReleaseWasAlreadyReleased,
} from '../../common/messages';

@Injectable()
export class JiraReleaseCreatedValidation implements PreDeploymentValidation {
  @Inject(TypeTokens.JiraApi) private readonly jiraClient: JiraClient;
  @Inject(ConfigService) private readonly config: ConfigService;

  async validate(release: Release): Promise<any> {
    const versions = await this.jiraClient.project.getVersions({
      projectIdOrKey: this.config.get('jira.projectIdOrKey'),
      orderBy: '-releaseDate',
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

    if (jiraRelease.released === true) {
      throw new HttpException(
        jiraReleaseWasAlreadyReleased(releaseVersion),
        500,
      );
    }
  }
}
