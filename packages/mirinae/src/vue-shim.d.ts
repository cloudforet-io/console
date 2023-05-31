declare module 'vue' {
    import type { CompatVue } from '@vue/runtime-dom';

    const Vue: CompatVue;
    export default Vue;
    // eslint-disable-next-line import/no-extraneous-dependencies
    export * from '@vue/runtime-dom';
    const { configureCompat } = Vue;
    export { configureCompat };
}
