import '@/styles/style.pcss';

import Vue from 'vue';

import { i18n, I18nConnector } from '@/translations';
import { withDesign } from 'storybook-addon-designs';
import VTooltip from 'v-tooltip';
import velocity from 'velocity-animate';
import Fragment from 'vue-fragment';
import VueI18n from 'vue-i18n';
import Notifications from 'vue-notification';
import VueRouter from 'vue-router';
import SvgIcon from 'vue-svgicon';
import webFontLoader from 'webfontloader';

import screens from '@/styles/screens.cjs';
import { fontUrls, webFonts } from '@/styles/web-fonts.cjs';

import SpaceOneTheme from './CloudforetTheme';

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(Notifications, { velocity });
Vue.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i',
});
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });

Vue.prototype.toJSON = function () {
    return this;
};

I18nConnector.i18n = i18n;


I18nConnector.i18n = i18n;

webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});


const viewports = {};
Object.keys(screens).forEach((k) => {
    const v = screens[k];
    viewports[k] = {
        name: k,
        styles: {
            width: v.min || v.max,
            height: '100%',
        },
    };
});

/** @type { import('@storybook/vue').Preview } */
const preview = {
  // parameters: {
  //   actions: { argTypesRegex: "^on[A-Z].*" },
  //   controls: {
  //     matchers: {
  //       color: /(background|color)$/i,
  //       date: /Date$/i,
  //     },
  //   },
  // },
  parameters : {
    controls: { expanded: true },
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
      storySort: (a, b) => a.title === b.title ? 0 : a.id.localeCompare(b.id, undefined, { numeric: true }),
        // storySort: (a, b) => (a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true })),
    },
    actions: { argTypesRegex: '^on.*' },
  },
  decorators: [
    (story, { globals: { locale } }) => {
        i18n.locale = locale;
        return {
            i18n,
            router: new VueRouter(),
            template: '<story/>',
        };
    },
  ],
  globalTypes: {
    locale: {
      name: 'locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
          icon: 'globe',
          items: [
              { value: 'en', right: '🇺🇸', title: 'English' },
              { value: 'ko', right: '🇰🇷', title: '한국어' },
              { value: 'jp', right: '🇯🇵', title: '日本語' },
          ],
      },
    },
  }
};

export default preview;
