import { CreatePullRequestsAction } from './create-pull-requests-action.service';
import { CompletePullRequestAction } from './complete-pull-request-action.service';

const postDeploymentActions = [
  CreatePullRequestsAction,
  CompletePullRequestAction,
];

const factory = postDeploymentActions.map(c => ({
  provide: c.name,
  useClass: c,
}));

export default [...postDeploymentActions, ...factory];
