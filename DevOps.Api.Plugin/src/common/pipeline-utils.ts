export const constants = {
  git: {
    branches: {
      MASTER: 'master',
      DEVELOP: 'develop',
      HOTFIX_PREFIX: 'hotfix/RCC-' /*TODO: check description*/,
      FEATURE_PREFIX: 'feature/RCC-' /*TODO: check description*/,
    },
    refs: {
      types: {
        MASTER: 'master',
        DEVELOP: 'develop',
        HOTFIX: 'hotfix',
        FEATURE: 'feature',
      },
      PREFIX: 'refs/heads/',
      MASTER: 'refs/heads/master',
      DEVELOP: 'refs/heads/develop',
      HOTFIX_PREFIX: 'refs/heads/hotfix/RCC-' /*TODO: check description*/,
      FEATURE_PREFIX: 'refs/heads/feature/RCC-' /*TODO: check description*/,
    },
  },
  environments: {
    PRODUCTION: 'PRODUCTION',
    QA: 'QA',
    STAGING: 'STAGING',
  },
  release: {
    variables: {
      RELEASE_VERSION_VARIABLE: 'ReleaseVersion',
    },
  },
};

export const removeGitRefPrefix = name =>
  name.replace(constants.git.refs.PREFIX, '');
export const isHotfix = name =>
  removeGitRefPrefix(name).startsWith(constants.git.branches.HOTFIX_PREFIX);
export const isDevelopBranch = name =>
  removeGitRefPrefix(name) === constants.git.branches.DEVELOP;
export const primaryArtifact = release =>
  release.artifacts.find(r => r.isPrimary);
export const gitRefName = release =>
  primaryArtifact(release).definitionReference.branch.name;
export const gitRefType = release =>
  Object.values(constants.git.refs.types).find(n =>
    removeGitRefPrefix(gitRefName(release)).startsWith(n),
  );
export const repositoryId = release =>
  primaryArtifact(release).definitionReference.repository.id;
export const projectName = release => release.projectReference.name;
export const releaseVersionVariableValue = release =>
  Object.keys(release.variables).includes(
    constants.release.variables.RELEASE_VERSION_VARIABLE,
  )
    ? release.variables.ReleaseVersion.value.trim()
    : undefined;

// tslint:disable-next-line:no-console
export const logJson = o => console.log(JSON.stringify(o, null, 2));
