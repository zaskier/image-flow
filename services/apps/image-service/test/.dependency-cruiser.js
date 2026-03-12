/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-application',
      comment: 'Domain layer should not depend on application layer',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { path: '^src/application' },
    },
    {
      name: 'domain-no-infrastructure',
      comment: 'Domain layer should not depend on infrastructure layer',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { path: '^src/infrastructure' },
    },
    {
      name: 'application-no-infrastructure',
      comment: 'Application layer should not depend on infrastructure layer',
      severity: 'error',
      from: { path: '^src/application' },
      to: { path: '^src/infrastructure' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
