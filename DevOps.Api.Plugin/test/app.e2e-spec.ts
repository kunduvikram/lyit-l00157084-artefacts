import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DevOpsApiModule } from '../src/devops-api.module';

describe('ReleaseController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DevOpsApiModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it(`POST`, () => {
    return request(app.getHttpServer())
      .post('/pipelines/projects/Rare-Carat/releases/2596/pre-deployment-validations/_validate?name=GitRefCommitsBehindMasterValidation')
      .expect(500)
      .expect({
        statusCode: 500,
        message: 'The source branch refs/heads/hotfix/RCC-3694-intercom-launcher has 93 commits behind the master branch.',
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
