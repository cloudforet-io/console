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
import VTooltip from 'v-tooltip';

import SpaceOneTheme from './SpaceOneTheme';
import {i18n} from '@/translations'

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


const viewports = {}
Object.keys(tailwindConfig.theme.screens).forEach(k => {
    const v = tailwindConfig.theme.screens[k];
    viewports[k] = {
        name: k,
        styles: {
            width: v.min || v.max,
            height: '100%',
        }
    }
})

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
    },
    viewport: {
        viewports,
    },
    options: {
        storySort: (a, b) =>
            a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
}
