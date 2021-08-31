import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { PreDeploymentValidation } from '../../interfaces';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  constants,
  gitRefName,
  logJson,
  primaryArtifact,
  removeGitRefPrefix,
  repositoryId,
} from '../../common/pipeline-utils';
import { WebApi } from 'azure-devops-node-api';

@Injectable()
export class ValidateBuildArtifactSourceVersion
  implements PreDeploymentValidation {
  @Inject(WebApi) private readonly azureDevOpsApi: WebApi;
  public static allowedGitRefTypes = [constants.git.refs.types.HOTFIX];

  async validate(release: Release): Promise<any> {
    const gitApi = await this.azureDevOpsApi.getGitApi();
    const branch = await gitApi.getBranch(
      repositoryId(release),
      removeGitRefPrefix(gitRefName(release)),
    );
    const buildArtifactSourceVersion = primaryArtifact(release)
      .definitionReference.sourceVersion.id;
    if (buildArtifactSourceVersion !== branch.commit.commitId) {
      throw new HttpException(
        `Invalid build artifact source version '${buildArtifactSourceVersion}'. The latest commit for the GitRef '${gitRefName(
          release,
        )}' is '${branch.commit.commitId}'.`,
        500,
      );
    }
  }
}
