declare module 'vue-focus' {
    import type { DirectiveFunction, DirectiveOptions } from 'vue';

    export const focus: DirectiveFunction;
    export const Plugin: DirectiveOptions<undefined>;

    export default focus;
}
