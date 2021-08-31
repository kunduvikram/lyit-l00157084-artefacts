import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PreDeploymentValidation } from '../../interfaces';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { WebApi } from 'azure-devops-node-api';
import {
  constants,
  repositoryId,
  gitRefName,
  projectName,
  removeGitRefPrefix,
} from '../../common/pipeline-utils';
import { sourceGitRefHasCommitsBehindMaster } from '../../common/messages';

@Injectable()
export class GitRefCommitsBehindMasterValidation
  implements PreDeploymentValidation {
  @Inject(WebApi) public readonly azureDevOpsApi: WebApi;

  async validate(release: Release): Promise<any> {
    const gitApi = await this.azureDevOpsApi.getGitApi();

    const sourceGitRef = gitRefName(release);
    const commitDiffs = await gitApi.getCommitDiffs(
      repositoryId(release),
      projectName(release),
      true,
      0,
      0,
      { version: constants.git.branches.MASTER },
      { version: removeGitRefPrefix(sourceGitRef) },
    );

    if (commitDiffs.behindCount > 0) {
      throw new HttpException(
        sourceGitRefHasCommitsBehindMaster(
          sourceGitRef,
          commitDiffs.behindCount,
        ),
        500,
      );
    }
  }
}
