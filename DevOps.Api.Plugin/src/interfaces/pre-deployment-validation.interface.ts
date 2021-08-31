import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';

export interface PreDeploymentValidation {
  validate(release: Release): Promise<any>;
}
