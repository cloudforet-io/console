import 'floating-vue/dist/style.css';
import Notifications from '@kyvg/vue3-notification';
import { setOptions, VueSvgIconPlugin } from '@yzfe/vue3-svgicon';
import FloatingVue from 'floating-vue';
import velocity from 'velocity-animate';
import type { App } from 'vue';
import type { I18n } from 'vue-i18n';

import '@yzfe/svgicon/lib/svgicon.css';
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
        // appInstance.directive('tooltip', VTooltip);
        appInstance.use(VueSvgIconPlugin, {
            tagName: 'svgicon',
        });
        setOptions({
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
