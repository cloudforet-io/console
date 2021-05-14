module.exports = {
    branches: ['master', '+([0-9])?(.{+([0-9]),x}).x', { name: 'beta', prerelease: true }],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/git',
        '@semantic-release/github',
    ],
};
