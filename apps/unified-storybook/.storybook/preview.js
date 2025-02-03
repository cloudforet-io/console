import webFontLoader from 'webfontloader';

import screens from 'mirinae-foundation/screens.cjs';

import { fontUrls, webFonts } from 'mirinae-foundation/web-fonts.cjs';

import CloudforetTheme from './CloudforetTheme';
import { createTheme } from 'storybook-config-custom';

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

const preview = {
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
        theme: createTheme(CloudforetTheme),
    },
    viewport: {
        viewports,
    },
    options: {
      storySort: (a, b) => a.title === b.title ? 0 : a.id.localeCompare(b.id, undefined, { numeric: true }),
    },
    actions: { argTypesRegex: '^on.*' },
  },
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
