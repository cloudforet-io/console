// Google Analytics

import { addons } from '@storybook/addons';

import SpaceOneTheme from './CloudforetTheme';

window.STORYBOOK_GA_ID = 'UA-159327743-4';

addons.setConfig({
    theme: SpaceOneTheme,
});
