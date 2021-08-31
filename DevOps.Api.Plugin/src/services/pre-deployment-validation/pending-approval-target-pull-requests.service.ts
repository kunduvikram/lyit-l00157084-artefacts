import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WebApi } from 'azure-devops-node-api';
import { PreDeploymentValidation } from '../../interfaces';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import {
  constants,
  gitRefName,
  repositoryId,
} from '../../common/pipeline-utils';
import {
  GitPullRequestSearchCriteria,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import {
  targetPullRequestsApprovalRequired,
  targetPullRequestCreateRequired,
} from '../../common/messages';

@Injectable()
export class CodeReviewApprovedValidation implements PreDeploymentValidation {
  @Inject(WebApi) private readonly azureDevOpsApi: WebApi;

  async validate(release: Release): Promise<any> {
    const gitApi = await this.azureDevOpsApi.getGitApi();
    const sourceGitRef = gitRefName(release);
    const pullRequestCriteria: GitPullRequestSearchCriteria = {
      sourceRefName: sourceGitRef,
      targetRefName: constants.git.refs.MASTER,
      status: PullRequestStatus.Active,
    };

    const pullRequests = await gitApi.getPullRequests(
      repositoryId(release),
      pullRequestCriteria,
    );

    if (pullRequests.length === 0) {
      throw new HttpException(
        targetPullRequestCreateRequired(
          sourceGitRef,
          constants.git.refs.MASTER,
        ),
        500,
      );
    }

    if (
      pullRequests.some(
        pr =>
          pr.reviewers.length === 0 || pr.reviewers.some(r => r.vote !== 10),
      )
    ) {
      throw new HttpException(
        targetPullRequestsApprovalRequired(
          sourceGitRef,
          pullRequests,
          constants.git.refs.MASTER,
        ),
        500,
      );
    }
  }
}
