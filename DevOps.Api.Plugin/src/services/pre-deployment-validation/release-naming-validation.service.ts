import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { PreDeploymentValidation } from '../../interfaces';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import JiraClient from 'jira-connector';
import semver = require('semver');
import {
  gitRefName,
  isHotfix,
  releaseVersionVariableValue,
} from '../../common/pipeline-utils';
import {
  hotfixIncrementMinorVersionRequired,
  releaseSemanticVersionRequired,
  releaseVersionIncrementRequired,
  releaseVersionNotProvidedOrEmpty,
} from '../../common/messages';
import { TypeTokens } from '../../common/type-tokens';

@Injectable()
export class ReleaseNamingValidation implements PreDeploymentValidation {
  @Inject(TypeTokens.JiraApi) private readonly jiraClient: JiraClient;
  @Inject(ConfigService) private readonly config: ConfigService;

  async validate(release: Release): Promise<any> {
    const releaseVersion = releaseVersionVariableValue(release);

    if (!releaseVersion) {
      throw new HttpException(releaseVersionNotProvidedOrEmpty(), 500);
    }

    if (semver.valid(releaseVersion) == null) {
      throw new HttpException(
        releaseSemanticVersionRequired(releaseVersion),
        500,
      );
    }

    const latestReleasedVersion = await this.getLatestReleasedVersion();

    if (latestReleasedVersion) {
      if (
        isHotfix(gitRefName(release)) &&
        semver.inc(latestReleasedVersion.name, 'patch') !== releaseVersion
      ) {
        throw new HttpException(
          hotfixIncrementMinorVersionRequired(
            releaseVersion,
            latestReleasedVersion.name,
            semver.inc(latestReleasedVersion.name, 'patch'),
          ),
          500,
        );
      } else if (semver.lte(releaseVersion, latestReleasedVersion.name)) {
        throw new HttpException(
          releaseVersionIncrementRequired(
            releaseVersion,
            latestReleasedVersion.name,
          ),
          500,
        );
      }
    }
  }

  async getLatestReleasedVersion() {
    const versions =
      (await this.jiraClient.project.getVersions({
        projectIdOrKey: this.config.get('jira.projectIdOrKey'),
      })) || [];
    return versions
      .reverse()
      .find(v => v.released === true && semver.valid(v.name) !== null);
  }
}
