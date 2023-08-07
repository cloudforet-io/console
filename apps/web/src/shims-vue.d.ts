declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  interface ComponentCustomOptions {
    beforeRouteEnter?(to: Route, from: Route, next: () => void): void
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
