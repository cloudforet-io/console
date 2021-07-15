module.exports = {
    branches: [
        { name: 'master' }
    ],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/npm',
        '@semantic-release/github',
        //
        '@semantic-release/git',
        '@semantic-release/changelog',
        ['@semantic-release/exec', {
            'prepareCmd': 'cp package.json dist/package.json && cd dist'
        }]
    ]
};
