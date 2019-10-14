import {configure, addParameters, addDecorator} from '@storybook/vue';
import {INITIAL_VIEWPORTS} from '@storybook/addon-viewport';
import {withA11y} from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';
import '@storybook/addon-console';
import BootstrapVue from 'bootstrap-vue';

// automatically import all files ending in *.stories.js
configure(require.context('../src/components', true, /\.stories\.js$/), module);
configure(require.context('../stories', true, /\.stories\.js$/), module);
addDecorator(withA11y);
addDecorator(centered);
addParameters({
    viewport: {
        viewports: INITIAL_VIEWPORTS,
    },

});
