import createLogger from 'vuex/dist/logger';

import displayPlugins from '@/store/modules/display/plugins';
// eslint-disable-next-line import/no-cycle
import userPlugins from '@/store/modules/user/plugins';

const DEBUG = import.meta.env.DEV;

const PLUGINS = [
    ...userPlugins,
    ...displayPlugins,
];

const logger = createLogger({
    logMutations: true,
    logActions: false,
});

export default DEBUG ? [logger, ...PLUGINS] : PLUGINS;
