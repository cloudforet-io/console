
import VTooltip from 'v-tooltip';
import velocity from 'velocity-animate';
import type { App } from 'vue';
import type VueI18n from 'vue-i18n';
import type { NotificationOptions } from 'vue-notification';
import Notifications from 'vue-notification';
import SvgIcon from 'vue-svgicon';

import { i18n, I18nConnector } from '@/translations';

import { applyAmchartsGlobalSettings } from './plugins/amcharts';

export interface MirinaeOptions {
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

    private static _install(appInstance: App) {
        const options = MirinaeInstaller._options;

        // Install internal plug-ins
        appInstance.use(Notifications, { velocity });
        appInstance.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        appInstance.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });

        // The role of this option is whether to use internal I18n config or external project config.
        I18nConnector.i18n = options.vueI18n ?? i18n;

        applyAmchartsGlobalSettings(options?.amchartsLicenses);
    }

    static install = (appInstance: App, options: MirinaeOptions = {}) => {
        MirinaeInstaller._options = options;
        MirinaeInstaller._install(appInstance);
    };
}
