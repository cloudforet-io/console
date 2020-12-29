declare module 'vue-focus' {
    import Vue, { AsyncComponent, ComponentOptions, PluginObject } from 'vue';

    type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent

    export const focus: Component;
    export const Plugin: PluginObject<undefined>;

    export default focus;
}
