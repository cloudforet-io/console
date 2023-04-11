const config = {
    branches: ['master',
        { name: 'beta', prerelease: true, channel: 'beta' },
        { name: '(console-release-)([0-9]+)?(.[0-9]+)?(.[0-9]+)', prerelease: true, channel: 'console-release' },
    ],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/npm',
        '@semantic-release/git',
        '@semantic-release/github',
    ],
};


if (config.branches.some((it) => !it.prerelease)) {
    config.plugins.push(
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
    );
}

module.exports = config;
