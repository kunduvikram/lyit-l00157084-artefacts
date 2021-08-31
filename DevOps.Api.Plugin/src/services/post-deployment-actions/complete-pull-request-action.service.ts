import { Inject, Injectable } from '@nestjs/common';
import { PostDeploymentAction } from '../../interfaces';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { WebApi } from 'azure-devops-node-api';
import {
  constants,
  gitRefName,
  repositoryId,
} from '../../common/pipeline-utils';
import {
  GitPullRequestSearchCriteria,
  PullRequestStatus,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import { CodeReviewApprovedValidation } from '../pre-deployment-validation/pending-approval-target-pull-requests.service';

@Injectable()
export class CompletePullRequestAction implements PostDeploymentAction {
  @Inject(WebApi) public readonly azureDevOpsApi: WebApi;
  @Inject(CodeReviewApprovedValidation.name)
  pendingApprovalTargetPullRequests: CodeReviewApprovedValidation;

  async execute(release: Release): Promise<any> {
    await this.pendingApprovalTargetPullRequests.validate(release);

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

    await Promise.all(
      pullRequests.map(pr => {
        pr.status = PullRequestStatus.Completed;
        return gitApi.updatePullRequest(
          {
            status: PullRequestStatus.Completed,
            lastMergeSourceCommit: pr.lastMergeSourceCommit,
          },
          repositoryId(release),
          pr.pullRequestId,
        );
      }),
    );
  }
}
