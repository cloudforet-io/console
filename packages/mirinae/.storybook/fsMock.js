module.exports = {
    readFileSync: () => 'mocked file',
}
/**
 * This File is created to solve a build error in Storybook.
 * We need to use ejs package for render something(ex. console link), however, that package creates an error 'Module not found: Error: Can't resolve 'fs' in ejs'.
 * Therefore, this file could solve the aforementioned problem by deceiving Webpack.(mock fs file)
 * **/
