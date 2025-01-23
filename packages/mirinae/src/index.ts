import type { PluginObject } from 'vue';

import type { MirinaeOptions } from './install';
import { MirinaeInstaller } from './install';

const mirinaeOptions: PluginObject<MirinaeOptions> = {
    install: MirinaeInstaller.install,
};

/* Plugin */
export default mirinaeOptions;

/* Languages */
export { messages } from './translations';

/* Styles */
export { default as colors } from 'mirinae-foundation/colors.cjs';
export { default as screens } from 'mirinae-foundation/screens.cjs';
export { default as styleVariables } from './styles/variables.cjs';
export { default as fonts } from 'mirinae-foundation/web-fonts.cjs';

/* Components */
export * from './components';

/* Composables */
export * from './hooks';

/* Utils */
export * from './utils';
