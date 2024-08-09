import type { PluginFunction, VueConstructor } from 'vue';

import VTooltip from 'v-tooltip';
import velocity from 'velocity-animate';
import Fragment from 'vue-fragment';
import type VueI18n from 'vue-i18n';
import type { NotificationOptions } from 'vue-notification';
import Notifications from 'vue-notification';
import SvgIcon from 'vue-svgicon';

import { i18n, I18nConnector } from '@/translations';


export interface MirinaeOptions {
    installFragment?: boolean;
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

        // Install internal plug-ins
        vueConstructor.use(Notifications, { velocity });
        vueConstructor.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        vueConstructor.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });

        // The role of this option is whether to use internal I18n config or external project config.
        I18nConnector.i18n = options.vueI18n ?? i18n;

        // Fragment is to be removed after vue 3 migration.
        if (options?.installFragment) vueConstructor.use(Fragment.Plugin);
    }

    static install: PluginFunction<MirinaeOptions> = (vueConstructor: VueConstructor, options: MirinaeOptions = {}) => {
        MirinaeInstaller._options = options;
        MirinaeInstaller._install(vueConstructor);
    };
}
