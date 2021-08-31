import {
  Controller,
  HttpException,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { WebApi } from 'azure-devops-node-api';
import { IReleaseApi } from 'azure-devops-node-api/ReleaseApi';
import { Release } from 'azure-devops-node-api/interfaces/ReleaseInterfaces';
import { ModuleRef } from '@nestjs/core';
import { PostDeploymentAction, PreDeploymentValidation } from '../interfaces';

@Controller('pipelines')
export class ReleasesController {
  @Inject(WebApi) private readonly azureDevOpsApi: WebApi;
  @Inject(ModuleRef) private readonly moduleRef: ModuleRef;

  private async getRelease(
    project: string,
    releaseId: number,
  ): Promise<Release> {
    const releaseApi: IReleaseApi = await this.azureDevOpsApi.getReleaseApi();
    return await releaseApi.getRelease(project, releaseId);
  }

  @Post(
    'projects/:project/releases/:releaseId/pre-deployment-validations/_validate',
  )
  async validatePreDeploymentCondition(
    @Param('project') project: string,
    @Param('releaseId') releaseId: number,
    @Query('name') name,
  ): Promise<any> {
    try {
      // hardcoded values
      project = 'Rare-Carat';
      const release: Release = await this.getRelease(project, releaseId);
      const validation: PreDeploymentValidation = this.moduleRef.get(name);
      await validation.validate(release);
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Post(
    'projects/:project/releases/:releaseId/post-deployment-actions/_execute',
  )
  async ExecutePostDeploymentAction(
    @Param('project') project: string,
    @Param('releaseId') releaseId: number,
    @Query('name') name,
  ): Promise<any> {
    try {
      // hardcoded values
      project = 'Rare-Carat';
      const release: Release = await this.getRelease(project, releaseId);
      const action: PostDeploymentAction = this.moduleRef.get(name);
      await action.execute(release);
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
