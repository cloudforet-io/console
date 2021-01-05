import {configure, addParameters, addDecorator} from '@storybook/vue';
import {withA11y} from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';
import '@storybook/addon-console';
import { withDesign } from 'storybook-addon-designs';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';

import Vue from 'vue';
import VueRouter from 'vue-router';
import directive from '@/directives';
import velocity from 'velocity-animate';
import { withKnobs } from '@storybook/addon-knobs';
import SvgIcon from 'vue-svgicon';
import { i18n } from '@/translations';
import LiquorTree from 'liquor-tree';
import Fragment from "vue-fragment";
import Codemirror from "vue-codemirror";

import webFontLoader from 'webfontloader';
import { fontUrls, webFonts } from '@spaceone/design-system/src/styles/web-fonts';

import tailwindConfig from './tailwind.config';
import _ from 'lodash';
import VTooltip from 'v-tooltip';
import "@spaceone/design-system/src/styles/reset.pcss";
import "@spaceone/design-system/src/styles/style.pcss";
import SpaceOneTheme from './SpaceOneTheme';


Vue.use(VueRouter);
Vue.use(Notifications, { velocity });
Vue.use(VueCompositionApi);
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i'
})
Vue.use(LiquorTree);
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip' });
Vue.use(Codemirror);

Vue.prototype.$velocity = velocity;
webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});
directive(Vue);

addParameters({
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
        viewports: {
            ..._.mapValues(tailwindConfig.theme.screens, (v, k) => ({
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
        showRoots: true,
        storySort: (a, b) =>
            a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
    },
});
addDecorator(withA11y);
addDecorator(withKnobs);
addDecorator(centered);
addDecorator(withDesign);
addDecorator(() => ({
    i18n,
    router: new VueRouter(),
    template: '<story/>',
}));
