import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { PreDeploymentValidation } from '../../interfaces';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { gitRefName, repositoryId } from '../../common/pipeline-utils';
import { WebApi } from 'azure-devops-node-api';
import {
  GitPullRequestSearchCriteria,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import { sourceGitRefHasPendingPullRequests } from '../../common/messages';

@Injectable()
export class SourceGitRefPendingPullRequestsValidation
  implements PreDeploymentValidation {
  @Inject(WebApi) public readonly azureDevOpsApi: WebApi;

  async validate(release: Release): Promise<any> {
    const gitApi = await this.azureDevOpsApi.getGitApi();
    const sourceGitRef = gitRefName(release);
    const pullRequestCriteria: GitPullRequestSearchCriteria = {
      targetRefName: sourceGitRef,
      status: PullRequestStatus.Active,
    };
    const pullRequests = await gitApi.getPullRequests(
      repositoryId(release),
      pullRequestCriteria,
    );
    if (pullRequests.length > 0) {
      throw new HttpException(
        sourceGitRefHasPendingPullRequests(sourceGitRef, pullRequests),
        500,
      );
    }
  }
}
