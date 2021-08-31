import { JiraReleaseCreatedValidation } from './jira-release-created-validation.service';
import { SourceGitRefPendingPullRequestsValidation } from './source-git-ref-pending-pull-requests-validation.service';
import { ProductionSourceGitRefValidation } from './production-source-git-ref-validation.service';
import { StagingSourceGitRefValidation } from './staging-source-git-ref-validation.service';
import { QASourceGitRefBranchValidation } from './qa-source-git-ref-validation.service';
import { ReleaseNamingValidation } from './release-naming-validation.service';
import { GitRefCommitsBehindMasterValidation } from './git-ref-commits-behind-master-validation.service';
import { JiraVersionReleasedValidation } from './jira-version-released-validation.service';
import { CodeReviewApprovedValidation } from './pending-approval-target-pull-requests.service';
import { ValidateBuildArtifactSourceVersion } from './validate-build-artifact-source-version.service';

const preDeploymentValidation = [
  JiraReleaseCreatedValidation,
  SourceGitRefPendingPullRequestsValidation,
  ProductionSourceGitRefValidation,
  StagingSourceGitRefValidation,
  QASourceGitRefBranchValidation,
  ReleaseNamingValidation,
  GitRefCommitsBehindMasterValidation,
  JiraVersionReleasedValidation,
  CodeReviewApprovedValidation,
  ValidateBuildArtifactSourceVersion,
];

const factory = preDeploymentValidation.map(c => ({
  provide: c.name,
  useClass: c,
}));

export default [...preDeploymentValidation, ...factory];
