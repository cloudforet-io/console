import config from '@/lib/config';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import router from '@/routes';
import { GTag } from '@/lib/gtag';
import { i18n } from '@/translations';

const initConfig = async () => {
    await config.init();
};

const initApiClient = async () => {
    await SpaceConnector.init(config.get('CONSOLE_API.ENDPOINT'), () => {
        // Add session expiration process
        store.dispatch('user/setIsSessionExpired', true);
    });
};

const initDomain = async () => {
    try {
        let domainName;
        if (config.get('DOMAIN_NAME_REF') === 'hostname') {
            const { hostname } = window.location;
            domainName = hostname.split('.')[0];
        } else {
            domainName = config.get('DOMAIN_NAME');
        }
        await store.dispatch('domain/load', domainName);
    } catch (e) {
        await router.push('/error-page');
    }
};

const initGtag = () => {
    GTag.init();
    store.watch(state => state.user.userId, (userId) => {
        GTag.setGtagUserID(store.state.domain.domainId, userId);
    }, { immediate: true });
};

const initLanguage = () => {
    store.watch(state => state.user.language, (lang) => {
        i18n.locale = lang as string;
    }, { immediate: true });
};

export const siteInit = async () => {
    try {
        await initConfig();
        await initApiClient();
        await initDomain();
        initGtag();
        initLanguage();
    } catch (e) {
        console.error(e);
    }
};
