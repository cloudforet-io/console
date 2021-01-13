window.STORYBOOK_GA_ID='UA-159327743-4' // Google Analytics

import { addons } from '@storybook/addons';
import SpaceOneTheme from './SpaceOneTheme';

addons.setConfig({
    theme: SpaceOneTheme,
});
