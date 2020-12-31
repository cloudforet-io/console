import Vue, { PluginObject, VueConstructor } from 'vue';
import VueI18n, { LocaleMessageObject } from 'vue-i18n';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import Codemirror from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import '@/styles/style.pcss';

import componentKO from '@/translations/language-pack/ko.json';
import componentEN from '@/translations/language-pack/en.json';
import componentJA from '@/translations/language-pack/ja.json';

import * as components from '@/components';

export * from '@/components';


// simple recursive remove keys with empty value
const removeEmpty = (obj: object | any): LocaleMessageObject => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

interface SpaceoneDSOptions {
    appSelector?: string;
}


const SpaceoneDS: PluginObject<SpaceoneDSOptions> = {
    install(_Vue: VueConstructor, options) {
        _Vue.use(VueI18n);
        _Vue.use(VueCompositionApi);
        _Vue.use(Notifications, { velocity });
        _Vue.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });

        _Vue.use(Fragment.Plugin);
        _Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        _Vue.use(Codemirror);


        const i18n = new VueI18n({
            locale: 'en', // set locale
            fallbackLocale: 'en',
            messages: {
                en: removeEmpty({ COMPONENT: componentEN }),
                ko: removeEmpty({ COMPONENT: componentKO }),
                jp: removeEmpty({ COMPONENT: componentJA }),
            },
            silentFallbackWarn: true,
        });

        new _Vue({ i18n }).$mount(options?.appSelector || '#app');
    },
};

// Vue.use(SpaceoneDS);
// Object.keys(components).forEach((name) => {
//     Vue.component(name, components[name]);
// });

export default SpaceoneDS;
