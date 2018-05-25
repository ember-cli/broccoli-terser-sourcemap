module.exports = {
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  testMatch: [
    '<rootDir>/index.js',
    '<rootDir>/lib/**/*.js',
    '<rootDir>/test/*.js',
  ],
};
