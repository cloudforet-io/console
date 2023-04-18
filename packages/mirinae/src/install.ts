import type { PluginFunction, VueConstructor } from 'vue';

import VTooltip from 'v-tooltip';
import velocity from 'velocity-animate';
import Fragment from 'vue-fragment';
import VueI18n from 'vue-i18n';
import type { NotificationOptions } from 'vue-notification';
import Notifications from 'vue-notification';
import VueRouter from 'vue-router';
import SvgIcon from 'vue-svgicon';

import { i18n, I18nConnector } from '@/translations';

import { applyAmchartsGlobalSettings } from './plugins/amcharts';

export interface MirinaeOptions {
    installVueRouter?: boolean;
    installVueI18n?: boolean;
    installFragment?: boolean;
    amchartsLicenses?: string[];
    vueI18n?: VueI18n;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare module 'vue/types/vue' {
    interface Vue {
        $notify: (options: NotificationOptions | string) => void;
    }
	// eslint-disable-next-line @typescript-eslint/no-shadow
    interface VueConstructor {
        notify: (options: NotificationOptions | string) => void;
    }
}


export class MirinaeInstaller {
    private static _options: MirinaeOptions;

    static get options() {
        return MirinaeInstaller._options;
    }

    private static _install(vueConstructor: VueConstructor) {
        const options = MirinaeInstaller._options;
        if (options?.installVueRouter) vueConstructor.use(VueRouter);
        if (options?.installVueI18n) vueConstructor.use(VueI18n);
        if (options?.installFragment) vueConstructor.use(Fragment.Plugin);
        vueConstructor.use(Notifications, { velocity });
        vueConstructor.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });
        vueConstructor.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        I18nConnector.i18n = options.vueI18n ?? i18n;
        applyAmchartsGlobalSettings(options?.amchartsLicenses);
    }

    static install: PluginFunction<MirinaeOptions> = (vueConstructor: VueConstructor, options: MirinaeOptions = {}) => {
        MirinaeInstaller._options = options;
        MirinaeInstaller._install(vueConstructor);
    };
}
