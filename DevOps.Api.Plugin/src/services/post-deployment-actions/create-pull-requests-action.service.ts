import { Inject, Injectable } from '@nestjs/common';
import { PostDeploymentAction } from '../../interfaces';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { WebApi } from 'azure-devops-node-api';
import {
  gitRefName,
  isDevelopBranch,
  isHotfix,
  logJson,
  projectName,
  removeGitRefPrefix,
  repositoryId,
} from '../../common/pipeline-utils';
import { GitVersionType } from 'azure-devops-node-api/interfaces/GitInterfaces';
import moment = require('moment');

@Injectable()
export class CreatePullRequestsAction implements PostDeploymentAction {
  @Inject(WebApi) public readonly azureDevOpsApi: WebApi;

  async execute(release: Release): Promise<any> {
    const sourceGitRef = gitRefName(release);
    const gitApi = await this.azureDevOpsApi.getGitApi();
    const branches = await gitApi.getBranches(
      repositoryId(release),
      projectName(release),
      { versionType: GitVersionType.Branch },
    );

    const inProgressHotfixBranches = branches.filter(
      b =>
        b.name !== removeGitRefPrefix(gitRefName(release)) &&
        (moment().diff(b.commit.committer.date, 'd') <= 5 && isHotfix(b.name)),
    );

    const developBranch = branches.filter(
      b =>
        b.name !== removeGitRefPrefix(gitRefName(release)) &&
        isDevelopBranch(b.name),
    );

    await Promise.all(
      [...inProgressHotfixBranches, ...developBranch].map(async b => {
        const commitDiffs = await gitApi.getCommitDiffs(
          repositoryId(release),
          projectName(release),
          true,
          1,
          0,
          { version: removeGitRefPrefix(sourceGitRef) },
          { version: b.name },
        );

        logJson(commitDiffs);

        // await gitApi.createPullRequest({
        //   sourceRefName: sourceGitRef,
        //   targetRefName: b.name,
        // }, repositoryId(release), projectName(release));
      }),
    );
  }
}
