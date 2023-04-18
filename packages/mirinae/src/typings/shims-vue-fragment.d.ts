declare module 'vue-fragment' {
    import type { AsyncComponent, ComponentOptions, PluginObject } from 'vue';
import type Vue from 'vue';

    type Component = ComponentOptions<Vue> | typeof Vue | AsyncComponent;

    export const Fragment: Component;
    export const Plugin: PluginObject<undefined>;

    // namespace VueFragment {
    //     export const Fragment: Component;
    //     export const Plugin: PluginObject<undefined>;
    // }
    export default VueFragment;
}
