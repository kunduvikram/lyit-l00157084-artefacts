import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { PreDeploymentValidation } from '../../interfaces';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { constants, gitRefName, gitRefType } from '../../common/pipeline-utils';
import { WebApi } from 'azure-devops-node-api';
import { invalidSourceGitRefForEnvironment } from '../../common/messages';

@Injectable()
export class QASourceGitRefBranchValidation implements PreDeploymentValidation {
  @Inject(WebApi) private readonly azureDevOpsApi: WebApi;
  public static allowedGitRefTypes = [
    constants.git.refs.types.HOTFIX,
    constants.git.refs.types.FEATURE,
    constants.git.refs.types.DEVELOP,
  ];

  async validate(release: Release): Promise<any> {
    const sourceGitRefType = gitRefType(release);
    if (
      !QASourceGitRefBranchValidation.allowedGitRefTypes.includes(
        sourceGitRefType,
      )
    ) {
      throw new HttpException(
        invalidSourceGitRefForEnvironment(
          gitRefName(release),
          constants.environments.QA,
          QASourceGitRefBranchValidation.allowedGitRefTypes,
        ),
        500,
      );
    }
  }
}
