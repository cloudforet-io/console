declare module 'vue' {
    import type { CompatVue } from 'vue';

    const Vue: CompatVue;
    export default Vue;
    // eslint-disable-next-line vue/prefer-import-from-vue,import/no-extraneous-dependencies
    export * from '@vue/runtime-dom';
    const { configureCompat } = Vue;
    export { configureCompat };
}
