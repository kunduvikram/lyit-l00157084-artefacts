import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PreDeploymentValidation } from '../../interfaces';
import { WebApi } from 'azure-devops-node-api';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { constants, gitRefName, gitRefType } from '../../common/pipeline-utils';
import { invalidSourceGitRefForEnvironment } from '../../common/messages';

@Injectable()
export class ProductionSourceGitRefValidation
  implements PreDeploymentValidation {
  @Inject(WebApi) private readonly azureDevOpsApi: WebApi;
  public static allowedGitRefTypes = [
    constants.git.refs.types.HOTFIX,
    constants.git.refs.types.DEVELOP,
  ];

  async validate(release: Release): Promise<any> {
    const sourceGitRefType = gitRefType(release);
    if (
      !ProductionSourceGitRefValidation.allowedGitRefTypes.includes(
        sourceGitRefType,
      )
    ) {
      throw new HttpException(
        invalidSourceGitRefForEnvironment(
          gitRefName(release),
          constants.environments.PRODUCTION,
          ProductionSourceGitRefValidation.allowedGitRefTypes,
        ),
        500,
      );
    }
  }
}
