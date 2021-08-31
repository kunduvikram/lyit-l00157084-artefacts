import AzureDevOpsApiFactory from './azure-devops-api.service';
import JiraApi from './jira-api.service';
import PreDeploymentValidations from './pre-deployment-validation';
import PostDeploymentActions from './post-deployment-actions';

export default [
  AzureDevOpsApiFactory,
  JiraApi,
  ...PreDeploymentValidations,
  ...PostDeploymentActions,
];
