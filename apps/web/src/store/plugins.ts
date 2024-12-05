import createLogger from 'vuex/dist/logger';

import displayPlugins from '@/store/modules/display/plugins';


const DEBUG = import.meta.env.DEV;

const PLUGINS = [
    ...displayPlugins,
];

const logger = createLogger({
    logMutations: true,
    logActions: false,
});

export default DEBUG ? [logger, ...PLUGINS] : PLUGINS;
