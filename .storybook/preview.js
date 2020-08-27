import {configure, addParameters, addDecorator} from '@storybook/vue';
import {withA11y} from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';
import '@storybook/addon-console';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';

import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import directive from '@/directives';
import velocity from 'velocity-animate';
import { Util } from '@/lib/global-util';
import { withKnobs } from '@storybook/addon-knobs';
import SvgIcon from 'vue-svgicon';
import { i18n } from '@/translations';
import LiquorTree from 'liquor-tree';
import Fragment from "vue-fragment";

import webFontLoader from 'webfontloader';
import { fontUrls, webFonts } from '@/styles/web-fonts';

import tailwindConfig from './tailwind.config';
import _ from 'lodash';
import VTooltip from 'v-tooltip';
import "@/styles/style.scss";

Vue.use(VueRouter);
Vue.use(Notifications, { velocity });
Vue.use(VueCompositionApi);
Vue.mixin(Util);
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i'
})
Vue.use(LiquorTree);
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip' });

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
});
addDecorator(withA11y);
addDecorator(withKnobs);
addDecorator(centered);
addDecorator(() => ({
    i18n,
    store,
    router: new VueRouter(),
    template: '<story/>',
}));
