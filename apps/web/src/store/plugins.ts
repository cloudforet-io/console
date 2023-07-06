import { createLogger } from 'vuex';

import settingsPlugins from '@/store/modules/settings/plugins';
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
