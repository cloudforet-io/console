import createLogger from 'vuex/dist/logger';

import settingsPlugins from '@/store/modules/settings/plugins';
// eslint-disable-next-line import/no-cycle
import userPlugins from '@/store/modules/user/plugins';

const DEBUG = import.meta.env.DEV;

const PLUGINS = [
    ...userPlugins,
    ...settingsPlugins,
];

const logger = createLogger({
    logMutations: true,
    logActions: false,
});

export default DEBUG ? [logger, ...PLUGINS] : PLUGINS;
