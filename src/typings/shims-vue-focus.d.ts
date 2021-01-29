declare module 'vue-focus' {
    import { DirectiveFunction, DirectiveOptions } from 'vue';

    export const focus: DirectiveFunction;
    export const Plugin: DirectiveOptions<undefined>;

    export default focus;
}
