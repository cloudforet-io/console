import config from '@/lib/config';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import router from '@/routes';
import { GTag } from '@/lib/gtag';
import { i18n } from '@/translations';
import * as am4core from '@amcharts/amcharts4/core';

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

const initAmchartsLicense = () => {
    if (config.get('AMCHARTS_LICENSE.CHARTS')) {
        am4core.addLicense(config.get('AMCHARTS_LICENSE.CHARTS'));
    }
    if (config.get('AMCHARTS_LICENSE.MAPS')) {
        am4core.addLicense(config.get('AMCHARTS_LICENSE.MAPS'));
    }
    if (config.get('AMCHARTS_LICENSE.TIMELINE')) {
        am4core.addLicense(config.get('AMCHARTS_LICENSE.TIMELINE'));
    }
};


export const siteInit = async () => {
    try {
        await initConfig();
        await initApiClient();
        await initDomain();
        initGtag();
        initLanguage();
        initAmchartsLicense();
    } catch (e) {
        console.error(e);
    }
};
