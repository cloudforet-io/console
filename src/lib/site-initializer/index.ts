import config from '@/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import { SpaceRouter } from '@/router';
import { GTag } from '@/lib/gtag';
import * as am4core from '@amcharts/amcharts4/core';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { computed } from '@vue/composition-api';
import { initLanguageAndFonts } from '@/lib/site-initializer/locales';
import { serviceRoutes } from '@/router/service-routes';
import { adminDomainServiceRoutes } from '@/router/admin-domain-service-routes';
import { errorRoutes } from '@/router/error-routes';


const initConfig = async () => {
    await config.init();
};

const initApiClient = async () => {
    await SpaceConnector.init(config.get('CONSOLE_API.ENDPOINT'), () => {
        // Add session expiration process
        store.dispatch('user/setIsSessionExpired', true);
    }, { endpoint: config.get('MOCK.ENDPOINT'), all: config.get('MOCK.ALL') });
};

const initDomain = async (): Promise<string|undefined> => {
    let domainName;
    if (config.get('DOMAIN_NAME_REF') === 'hostname') {
        const { hostname } = window.location;
        domainName = hostname.split('.')[0];
    } else {
        domainName = config.get('DOMAIN_NAME');
    }

    try {
        await store.dispatch('domain/load', domainName);
        return store.state.domain.name;
    } catch (e) {
        console.error(e);
        return undefined;
    }
};

const initGtag = () => {
    if (config.get('GTAG_ID') === 'DISABLED') return;
    GTag.init();
    store.watch(state => state.user.userId, (userId) => {
        GTag.setGtagUserID(store.state.domain.domainId, userId);
    }, { immediate: true });
};


const initQueryHelper = () => {
    QueryHelper.init(computed(() => store.state.user.timezone));
};

const initAmchartsLicense = () => {
    if (config.get('AMCHARTS_LICENSE.ENABLED')) {
        am4core.addLicense(config.get('AMCHARTS_LICENSE.CHARTS'));
        am4core.addLicense(config.get('AMCHARTS_LICENSE.MAPS'));
        am4core.addLicense(config.get('AMCHARTS_LICENSE.TIMELINE'));
    }
};

const initRouter = (domainName?: string) => {
    if (!domainName) {
        SpaceRouter.init(errorRoutes);
    } else if (domainName === config.get('ADMIN_DOMAIN')) {
        SpaceRouter.init(adminDomainServiceRoutes);
    } else {
        SpaceRouter.init(serviceRoutes);
    }
};

const removeInitializer = () => {
    const el = document.getElementById('site-loader-wrapper');
    if (el?.parentElement) el.parentElement.removeChild(el);
};

const init = async () => {
    /* Init SpaceONE Console */
    await initConfig();
    await initApiClient();
    const domainName = await initDomain();

    if (domainName) {
        initRouter(domainName);
        await initLanguageAndFonts();
        initQueryHelper();
        initGtag();
        initAmchartsLicense();
    } else {
        initRouter();
        throw new Error('Site initialization failed: No matched domain');
    }
};


const MIN_LOADING_TIME = 1000;
export const siteInit = async () => {
    store.dispatch('display/startInitializing');

    store.watch(state => state.display.isInitialized, (isInitialized) => {
        if (isInitialized) {
            const el = document.getElementById('site-loader-wrapper');
            if (el?.parentElement) el.parentElement.removeChild(el);
        }
    });

    let isMinTimePassed = false;
    let isFinishedInitializing = false;

    setTimeout(() => {
        isMinTimePassed = true;
        if (isFinishedInitializing) {
            store.dispatch('display/finishInitializing');
            removeInitializer();
        }
    }, MIN_LOADING_TIME);

    try {
        await init();
    } catch (e) {
        console.error(e);
        store.dispatch('display/finishInitializing');

        if (SpaceRouter.router) {
            await SpaceRouter.router.push('/error-page');
        }
    } finally {
        isFinishedInitializing = true;
        if (isMinTimePassed) {
            store.dispatch('display/finishInitializing');
            removeInitializer();
        }
    }
};
