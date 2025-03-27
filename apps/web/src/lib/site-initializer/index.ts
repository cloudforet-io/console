import { computed, watch } from 'vue';

import { QueryHelper } from '@cloudforet/core-lib/query';

import APIClientManager from '@/api-clients/api-client-manager';
import { SpaceRouter } from '@/router';
import { setI18nLocale } from '@/translations';

import { ERROR_ROUTE, ROOT_ROUTE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { integralRoutes } from '@/router/integral-routes';

import { useDisplayStore } from '@/store/display/display-store';
import { pinia } from '@/store/pinia';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { initRequestIdleCallback } from '@/lib/request-idle-callback-polyfill';
import { initAmcharts5 } from '@/lib/site-initializer/amcharts5';
import { initGtag, initGtm } from '@/lib/site-initializer/analysis';
import { initApiClient } from '@/lib/site-initializer/api-client';
import { initDayjs } from '@/lib/site-initializer/dayjs';
import { initDomain } from '@/lib/site-initializer/domain';
import { initDomainSettings } from '@/lib/site-initializer/domain-settings';
import { initEcharts } from '@/lib/site-initializer/echarts';
import { initErrorHandler } from '@/lib/site-initializer/error-handler';
import { initTaskManagementTemplate } from '@/lib/site-initializer/initTaskManagementTemplate';
import { mergeConfig } from '@/lib/site-initializer/merge-config';
import { initModeSetting } from '@/lib/site-initializer/mode-setting';
import { checkSsoAccessToken } from '@/lib/site-initializer/sso';
import { initUserAndAuth } from '@/lib/site-initializer/user-auth';
import { initWorkspace } from '@/lib/site-initializer/workspace';

import ServiceConfigurator from '@/services/configurator';

const initQueryHelper = () => {
    const userStore = useUserStore(pinia);
    QueryHelper.init(computed(() => userStore.state.timezone));
};

let isRouterInitialized = false;
const initRouter = (domainId?: string) => {
    const userStore = useUserStore(pinia);
    const allReferenceStore = useAllReferenceStore(pinia);
    const afterGrantedCallback = () => allReferenceStore.flush();

    const adminChildren = integralRoutes[0].children?.find(
        (route) => route.name === ROOT_ROUTE.ADMIN._NAME,
    )?.children;

    const workspaceChildren = integralRoutes[0].children?.find(
        (route) => route.name === ROOT_ROUTE.WORKSPACE._NAME,
    )?.children;

    if (adminChildren) {
        const dynamicAdminRoutes = ServiceConfigurator.getRoutes('admin');
        adminChildren.push(...dynamicAdminRoutes);
    }

    if (workspaceChildren) {
        const dynamicWorkspaceRoutes = ServiceConfigurator.getRoutes('workspace');
        workspaceChildren.push(...dynamicWorkspaceRoutes);
    }

    if (!domainId) {
        SpaceRouter.init(errorRoutes, afterGrantedCallback, userStore);
    } else {
        SpaceRouter.init(integralRoutes, afterGrantedCallback, userStore);
    }
    isRouterInitialized = true;
};

const initI18n = () => {
    const userStore = useUserStore(pinia);
    setI18nLocale(userStore.state.language || '');
};

const removeInitializer = () => {
    const el = document.getElementById('site-loader-wrapper');
    if (el?.parentElement) el.parentElement.removeChild(el);
};

const init = async () => {
    /* Init SpaceONE Console */
    try {
        await config.init();
        await initApiClient(config);
        const domainId = await initDomain(config);
        const userId = await initUserAndAuth(config);
        const mergedConfig = await mergeConfig(config, domainId);
        await ServiceConfigurator.initialize(mergedConfig);
        await APIClientManager.initialize(mergedConfig);
        initDomainSettings();
        initModeSetting();
        await initWorkspace(userId);
        initRouter(domainId);
        // prefetchResources();
        initI18n();
        initDayjs();
        initQueryHelper();
        initGtag(config);
        initGtm(config);
        initAmcharts5(config);
        initEcharts();
        initErrorHandler();
        initRequestIdleCallback();
        const results = await Promise.allSettled([
            checkSsoAccessToken(),
            initTaskManagementTemplate(),
        ]);
        const errors: any[] = [];
        results.forEach((result) => {
            if (result.status === 'rejected') {
                errors.push(result.reason);
            }
        });
        if (errors.length > 0) {
            throw errors;
        }
    } catch (e) {
        if (!isRouterInitialized) initRouter();
        throw e;
    }
};

const MIN_LOADING_TIME = 1000;
export const siteInit = async () => {
    const displayStore = useDisplayStore(pinia);
    displayStore.setIsInitialized(false);

    watch(() => displayStore.state.isInitialized, (isInitialized) => {
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
            displayStore.setIsInitialized(true);
            removeInitializer();
        }
    }, MIN_LOADING_TIME);

    try {
        await init();
    } catch (e) {
        console.error(e);
        displayStore.setIsInitialized(true);

        if (SpaceRouter.router) {
            await SpaceRouter.router.push({ name: ERROR_ROUTE._NAME });
        }
    } finally {
        isFinishedInitializing = true;
        if (isMinTimePassed) {
            displayStore.setIsInitialized(true);
            removeInitializer();
        }
    }
};
