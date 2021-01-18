import "@/styles/style.pcss";

import '@storybook/addon-console';
import { withDesign } from 'storybook-addon-designs';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';

import Vue from 'vue';
import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import Fragment from "vue-fragment";

import webFontLoader from 'webfontloader';
import { fontUrls, webFonts } from '@/styles/web-fonts';

import tailwindConfig from './tailwind.config';
import {mapValues} from 'lodash';
import VTooltip from 'v-tooltip';

import SpaceOneTheme from './SpaceOneTheme';
import componentEN from '@/translations/language-pack/en.json';
import componentKO from '@/translations/language-pack/ko.json';
import componentJA from '@/translations/language-pack/ja.json';

Vue.use(VueRouter)
Vue.use(VueI18n);
Vue.use(VueCompositionApi);
Vue.use(Notifications, { velocity });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i'
})
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });

webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});

// simple recursive remove keys with empty value
const removeEmpty = (obj) => Object.keys(obj)
    .filter((k) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

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


export const decorators = [
    withDesign,
    () => ({
        i18n,
        router: new VueRouter(),
        template: '<story/>',
    })
]

export const parameters = {
    layout: 'centered',
    docs: {
        extractComponentDescription: (component, { notes }) => {
            if (notes) {
                return typeof notes === 'string' ? notes : notes.markdown || notes.text;
            }
            return null;
        },
        theme: SpaceOneTheme,
        page: null,
    },
    // previewTabs: {
    //     canvas: {
    //         hidden: true
    //     }
    // },
    viewport: {
        viewports: {
            ...mapValues(tailwindConfig.theme.screens, (v, k) => ({
                name: k,
                styles: {
                    width: v.min || v.max,
                    height: '100vh',
                }
            })),
            '3xl': {
                name: '3xl',
                styles: {
                    width: '3440px',
                    height: '100vh',
                }
            }
        }
    },
    options: {
        storySort: (a, b) =>
            a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
    },
}
