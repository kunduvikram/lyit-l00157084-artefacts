import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { PreDeploymentValidation } from '../../interfaces';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  constants,
  gitRefName,
  gitRefType,
  logJson,
  primaryArtifact,
  projectName,
  removeGitRefPrefix,
  repositoryId,
} from '../../common/pipeline-utils';
import { WebApi } from 'azure-devops-node-api';
import { GitVersionType } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { invalidSourceGitRefForEnvironment } from '../../common/messages';

@Injectable()
export class StagingSourceGitRefValidation implements PreDeploymentValidation {
  @Inject(WebApi) private readonly azureDevOpsApi: WebApi;
  public static allowedGitRefTypes = [constants.git.refs.types.HOTFIX];

  async validate(release: Release): Promise<any> {
    const sourceGitRefType = removeGitRefPrefix(gitRefType(release));

    if (
      !StagingSourceGitRefValidation.allowedGitRefTypes.includes(
        sourceGitRefType,
      )
    ) {
      throw new HttpException(
        invalidSourceGitRefForEnvironment(
          gitRefName(release),
          constants.environments.STAGING,
          StagingSourceGitRefValidation.allowedGitRefTypes,
        ),
        500,
      );
    }
  }
}
