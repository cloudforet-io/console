import { PluginFunction, VueConstructor } from 'vue';
import VueI18n from 'vue-i18n';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import VueCompositionApi from '@vue/composition-api';
import Notifications, { NotificationOptions } from 'vue-notification';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import VueRouter from 'vue-router';
import { applyAmchartsGlobalSettings } from './plugins/amcharts';

export interface SpaceoneDSOptions {
    installVueRouter?: boolean;
    installVueI18n?: boolean;
    installVueCompositionApi?: boolean;
    installFragment?: boolean;
    amchartsLicenses?: string[];
}


declare module 'vue/types/vue' {
    interface Vue {
        $notify: (options: NotificationOptions | string) => void;
    }
    interface VueConstructor {
        notify: (options: NotificationOptions | string) => void;
    }
}


export class SpaceDSInstaller {
    private static _options: SpaceoneDSOptions;

    static get options() {
        return SpaceDSInstaller._options;
    }

    private static _install(_Vue: VueConstructor) {
        const options = SpaceDSInstaller._options;
        if (options?.installVueRouter) _Vue.use(VueRouter);
        if (options?.installVueI18n) _Vue.use(VueI18n);
        if (options?.installVueCompositionApi) _Vue.use(VueCompositionApi);
        if (options?.installFragment) _Vue.use(Fragment.Plugin);
        _Vue.use(Notifications, { velocity });
        _Vue.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });
        _Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        applyAmchartsGlobalSettings(options?.amchartsLicenses);
    }

    static install: PluginFunction<SpaceoneDSOptions> = (_Vue: VueConstructor, options: SpaceoneDSOptions = {}) => {
        SpaceDSInstaller._options = options;
        SpaceDSInstaller._install(_Vue);
    }
}
