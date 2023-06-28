import type { Route } from 'vue-router';
// vue-shim.d.ts
declare module 'vue' {
  import type { CompatVue } from 'vue';

  interface ComponentCustomOptions {
    beforeRouteEnter?(to: Route, from: Route, next: () => void): void
  }

  const Vue: CompatVue;
  export default Vue;
  export * from '@vue/runtime-dom';
  const { configureCompat } = Vue;
  export { configureCompat };
}
