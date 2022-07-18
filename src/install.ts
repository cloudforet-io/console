import VueCompositionApi from '@vue/composition-api';
import type { PluginFunction, VueConstructor } from 'vue';

import VTooltip from 'v-tooltip';
import velocity from 'velocity-animate';
import Fragment from 'vue-fragment';
import VueI18n from 'vue-i18n';
import type { NotificationOptions } from 'vue-notification';
import Notifications from 'vue-notification';
import VueRouter from 'vue-router';
import SvgIcon from 'vue-svgicon';

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
	// eslint-disable-next-line @typescript-eslint/no-shadow
    interface VueConstructor {
        notify: (options: NotificationOptions | string) => void;
    }
}


export class SpaceDSInstaller {
    private static _options: SpaceoneDSOptions;

    static get options() {
        return SpaceDSInstaller._options;
    }

    private static _install(vueConstructor: VueConstructor) {
        const options = SpaceDSInstaller._options;
        if (options?.installVueRouter) vueConstructor.use(VueRouter);
        if (options?.installVueI18n) vueConstructor.use(VueI18n);
        if (options?.installVueCompositionApi) vueConstructor.use(VueCompositionApi);
        if (options?.installFragment) vueConstructor.use(Fragment.Plugin);
        vueConstructor.use(Notifications, { velocity });
        vueConstructor.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });
        vueConstructor.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        applyAmchartsGlobalSettings(options?.amchartsLicenses);
    }

    static install: PluginFunction<SpaceoneDSOptions> = (vueConstructor: VueConstructor, options: SpaceoneDSOptions = {}) => {
        SpaceDSInstaller._options = options;
        SpaceDSInstaller._install(vueConstructor);
    }
}
