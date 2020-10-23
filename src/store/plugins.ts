import createLogger from 'vuex/dist/logger';
import userPlugins from '@/store/modules/user/plugins';
import settingsPlugins from '@/store/modules/settings/plugins';
import config from "@/lib/config";

const DEBUG = process.env.NODE_ENV !== 'production';
const PLUGINS = [
    ...userPlugins,
    ...settingsPlugins,
];

export default DEBUG ? [createLogger(), ...PLUGINS] : PLUGINS;
