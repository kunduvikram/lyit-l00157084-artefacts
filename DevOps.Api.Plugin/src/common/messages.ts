import { constants } from './pipeline-utils';

export const sourceGitRefHasCommitsBehindMaster = (sourceGitRef, behindCount) =>
  `The source GitRef ${sourceGitRef} has ${behindCount} commits behind the ${
    constants.git.branches.MASTER
  } branch.`;
export const jiraReleaseHasNotBeenCreated = releaseVersion =>
  `The JIRA release '${releaseVersion}' has not been created.`;
export const jiraReleaseWasAlreadyReleased = releaseVersion =>
  `The JIRA release '${releaseVersion}' was already released.`;
export const jiraVersionHasNotBeenReleased = releaseVersion =>
  `The JIRA release '${releaseVersion}' has not been released.`;
export const jiraReleaseHasNoIssuesFixed = releaseVersion =>
  `The JIRA release '${releaseVersion}' has no issues fixed.`;
export const invalidSourceGitRefForEnvironment = (
  sourceGitRef,
  environment,
  allowedTypes,
) =>
  `Invalid source GitRef ${sourceGitRef} for ${environment} environment. Allowed GitRef types are ${allowedTypes.join(
    ', ',
  )}.`;
export const releaseVersionNotProvidedOrEmpty = () =>
  `The parameter ${
    constants.release.variables.RELEASE_VERSION_VARIABLE
  } was not provided or empty.`;
export const releaseSemanticVersionRequired = releaseVersion =>
  `The release version parameter value '${releaseVersion}' should follow the semantic version standard.`;
export const sourceGitRefHasPendingPullRequests = (
  sourceGitRef,
  pullRequests,
) =>
  `The GitRef ${sourceGitRef} has ${
    pullRequests.length
  } pending pull request(s).`;
export const releaseVersionIncrementRequired = (next, latest) =>
  `The version ${next} should be increment the latest released version ${latest}.`;
export const hotfixIncrementMinorVersionRequired = (next, latest, expected) =>
  `Hotfix releases should increment the patch version. Current release candidate version is ${next} and latest released version is ${latest}. Expected version is ${expected}.`;
export const targetPullRequestsApprovalRequired = (
  sourceGitRef,
  pullRequests,
  target,
) =>
  `The release source GitRef ${sourceGitRef} has ${
    pullRequests.length
  } pending pull request(s) to the GitRef ${target}.`;
export const targetPullRequestCreateRequired = (sourceGitRef, target) =>
  `The release source GitRef ${sourceGitRef} has not created pull request to the GitRef ${target}.`;
