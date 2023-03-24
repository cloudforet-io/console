declare module 'vue-focus' {
    import type { AsyncComponent, ComponentOptions, PluginObject } from 'vue';
import type Vue from 'vue';

    type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent;

    export const focus: Component;
    export const Plugin: PluginObject<undefined>;

    export default focus;
}
