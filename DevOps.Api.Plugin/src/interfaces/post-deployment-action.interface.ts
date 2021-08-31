import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';

export interface PostDeploymentAction {
  execute(release: Release): Promise<any>;
}
