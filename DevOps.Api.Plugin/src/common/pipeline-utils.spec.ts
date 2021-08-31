import {
  constants,
  isDevelopBranch,
  isHotfix,
  primaryArtifact,
  projectName,
  releaseVersionVariableValue,
  removeGitRefPrefix,
  repositoryId,
  gitRefName,
  gitRefType,
} from './pipeline-utils';

describe('pipeline-utils', () => {
  describe('isHotfix', () => {
    it('should return true for a branch prefixed with hotfix/RCC-123', async () => {
      expect(isHotfix(`${constants.git.branches.HOTFIX_PREFIX}-123`)).toBe(
        true,
      );
    });
  });

  describe('isDevelopBranch', () => {
    it('should return true for a branch named develop', async () => {
      expect(isDevelopBranch(constants.git.branches.DEVELOP)).toBe(true);
    });
  });

  describe('primaryArtifact', () => {
    it('should return true for a primary artifact', async () => {
      expect(
        primaryArtifact({
          artifacts: [
            {
              isPrimary: true,
            },
          ],
        }),
      ).toBeDefined();
    });
  });

  describe('gitRefName', () => {
    it('should return master for a release that has a primary artifact from ref refs/heads/master', async () => {
      expect(
        gitRefName({
          artifacts: [
            {
              isPrimary: true,
              definitionReference: {
                branch: {
                  name: constants.git.refs.MASTER,
                },
              },
            },
          ],
        }),
      ).toBe(constants.git.refs.MASTER);
    });
  });

  describe('gitRefType', () => {
    it('should return hotfix for a release that has a primary artifact from ref refs/heads/hotfix/RCC-123', async () => {
      expect(
        gitRefType({
          artifacts: [
            {
              isPrimary: true,
              definitionReference: {
                branch: {
                  name: constants.git.branches.HOTFIX_PREFIX + '123',
                },
              },
            },
          ],
        }),
      ).toBe(constants.git.refs.types.HOTFIX);
    });
  });

  describe('repositoryId', () => {
    it('should return 1b19e4d2-c039-44b6-a122-60c8087280f5 for a release that has a primary artifact from repository 1b19e4d2-c039-44b6-a122-60c8087280f5', async () => {
      expect(
        repositoryId({
          artifacts: [
            {
              isPrimary: true,
              definitionReference: {
                repository: {
                  id: '1b19e4d2-c039-44b6-a122-60c8087280f5',
                },
              },
            },
          ],
        }),
      ).toBe('1b19e4d2-c039-44b6-a122-60c8087280f5');
    });
  });

  describe('projectName', () => {
    it('should return Rare-Carat for a release from project Rare-Carat', async () => {
      expect(
        projectName({
          projectReference: {
            name: 'Rare-Carat',
          },
        }),
      ).toBe('Rare-Carat');
    });
  });

  describe('releaseVersionVariableValue', () => {
    it('should return the value for a custom variable named ReleaseVersion from a release', async () => {
      expect(
        releaseVersionVariableValue({
          variables: {
            ReleaseVersion: {
              value: '1.0.0',
            },
          },
        }),
      ).toBe('1.0.0');
    });
  });

  describe('removeGitRefPrefix', () => {
    it('should return develop for GitRef refs/heads/develop', async () => {
      expect(removeGitRefPrefix(constants.git.refs.DEVELOP)).toBe(
        constants.git.branches.DEVELOP,
      );
    });
  });
});
