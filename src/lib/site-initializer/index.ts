import config from '@/lib/config';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import router from '@/routes';
import { GTag } from '@/lib/gtag';
import { i18n } from '@/translations';
import * as am4core from '@amcharts/amcharts4/core';
import { defaultFonts, langFontsMap } from '@/styles/fonts';

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

const loadFont = async (fontsInfo) => {
    const fonts = fontsInfo.map(({ family, source, descriptors }) => {
        // @ts-ignore
        const font = new FontFace(family, source, descriptors);
        font.display = 'fallback';
        return font;
    });

    await Promise.all(fonts.map(d => d.load()));

    fonts.forEach((d) => {
        (document as any).fonts.add(d);
    });
};
const loaded: any = {};
const loadFonts = async (lang: string) => {
    let fonts: any = [];
    if (!loaded.default) {
        fonts = fonts.concat(defaultFonts);
        loaded.default = true;
    }

    if (!loaded[lang]) {
        fonts = fonts.concat(langFontsMap[lang]);
        await loadFont(fonts);
        loaded[lang] = true;
        document.body.lang = lang;
    }
};

const initLanguage = () => {
    store.watch(state => state.user.language, async (lang) => {
        i18n.locale = lang as string;
        await loadFonts(lang);
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

// const checkAuth = async () => {
//     if (!router.currentRoute.meta && !router.currentRoute.meta.excludeAuth && !SpaceConnector.isTokenAlive) {
//         await router.push({ name: 'SignIn', query: { nextPath: router.currentRoute.fullPath, error: router.currentRoute.query.error } });
//     }
// };

const removeInitializer = () => {
    const el = document.getElementById('site-loader-wrapper');
    if (el?.parentElement) el.parentElement.removeChild(el);
};

const init = async () => {
    try {
        await initConfig();
        // await checkAuth();
        await initApiClient();
        await initDomain();
        initGtag();
        initLanguage();
        initAmchartsLicense();
    } catch (e) {
        console.error(e);
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

    await init();
    isFinishedInitializing = true;
    if (isMinTimePassed) {
        store.dispatch('display/finishInitializing');
        removeInitializer();
    }
};
