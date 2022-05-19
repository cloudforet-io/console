import createLogger from 'vuex/dist/logger';

import displayPlugins from '@/store/modules/display/plugins';
import settingsPlugins from '@/store/modules/settings/plugins';
import userPlugins from '@/store/modules/user/plugins';

const DEBUG = process.env.NODE_ENV !== 'production';
const PLUGINS = [
    ...userPlugins,
    ...settingsPlugins,
    ...displayPlugins,
];

export default DEBUG ? [createLogger(), ...PLUGINS] : PLUGINS;
