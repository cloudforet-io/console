import 'floating-vue/dist/style.css';
import Notifications from '@kyvg/vue3-notification';
import FloatingVue from 'floating-vue';
import velocity from 'velocity-animate';
import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import SvgIcon from 'vue-svgicon';

import { i18n, I18nConnector } from '@/translations';

import { applyAmchartsGlobalSettings } from './plugins/amcharts';

export interface MirinaeOptions {
    amchartsLicenses?: string[];
    vueI18n?: I18n;
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
        appInstance.use(FloatingVue, { boundary: document.body });
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
