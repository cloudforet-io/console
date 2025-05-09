import { computed, watch } from 'vue';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { SpaceRouter } from '@/router';
import { setI18nLocale } from '@/translations';

import { ERROR_ROUTE, ROOT_ROUTE } from '@/router/constant';
import { errorRoutes } from '@/router/error-routes';
import { integralRoutes } from '@/router/integral-routes';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useDisplayStore } from '@/store/display/display-store';
import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';
import { pinia } from '@/store/pinia';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import APIClientManager from '@/lib/config/global-config/api-client-manager';
import featureSchemaManager from '@/lib/config/global-config/feature-schema-manager';
import { mergeConfig } from '@/lib/config/global-config/helpers/merge-config';
import type { GlobalServiceConfig } from '@/lib/config/global-config/types/type';
import { initRequestIdleCallback } from '@/lib/request-idle-callback-polyfill';
import { initAmcharts5 } from '@/lib/site-initializer/amcharts5';
import { initGtag, initGtm } from '@/lib/site-initializer/analysis';
import { initApiConnectorAndAuth } from '@/lib/site-initializer/api-connector';
import { initDayjs } from '@/lib/site-initializer/dayjs';
import { initDomain } from '@/lib/site-initializer/domain';
import { initDomainSettings } from '@/lib/site-initializer/domain-settings';
import { initEcharts } from '@/lib/site-initializer/echarts';
import { initErrorHandler } from '@/lib/site-initializer/error-handler';
import { initModeSetting } from '@/lib/site-initializer/mode-setting';
import { checkSsoAccessToken } from '@/lib/site-initializer/sso';
import { initUserAndToken } from '@/lib/site-initializer/user-token';
import { initWorkspace } from '@/lib/site-initializer/workspace';

import { useTaskManagementTemplateStore } from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


const initQueryHelper = () => {
    const userStore = useUserStore(pinia);
    QueryHelper.init(computed(() => userStore.state.timezone));
};

let isRouterInitialized = false;
const initRouter = (domainId?: string) => {
    const globalConfigSchemaStore = useGlobalConfigSchemaStore(pinia);
    const allReferenceStore = useAllReferenceStore(pinia);
    const authorizationStore = useAuthorizationStore(pinia);
    const afterGrantedCallback = () => allReferenceStore.flush();

    const adminChildren = integralRoutes[0].children?.find(
        (route) => route.name === ROOT_ROUTE.ADMIN._NAME,
    )?.children;

    const workspaceChildren = integralRoutes[0].children?.find(
        (route) => route.name === ROOT_ROUTE.WORKSPACE._NAME,
    )?.children;

    const featureRoutes = globalConfigSchemaStore.state.routeSchema;
    if (adminChildren) {
        adminChildren.push(...featureRoutes.adminRoutes);
    }

    if (workspaceChildren) {
        workspaceChildren.push(...featureRoutes.routes);
    }

    if (!domainId) {
        SpaceRouter.init(errorRoutes, afterGrantedCallback, authorizationStore);
    } else {
        SpaceRouter.init(integralRoutes, afterGrantedCallback, authorizationStore);
    }
    isRouterInitialized = true;
};

const initI18n = () => {
    const userStore = useUserStore(pinia);
    setI18nLocale(userStore.state.language || '');
};

const initOpsFlowTaskManagementTemplate = async (mergedConfig: GlobalServiceConfig) => {
    if (!mergedConfig.OPS_FLOW.ENABLED) return;
    const taskManagementTemplateStore = useTaskManagementTemplateStore(pinia);
    await Promise.allSettled([
        taskManagementTemplateStore.setInitialTemplateId(),
        taskManagementTemplateStore.setInitialLandingData(),
    ]);
};

const removeInitializer = () => {
    const el = document.getElementById('site-loader-wrapper');
    if (el?.parentElement) el.parentElement.removeChild(el);
};

const init = async () => {
    /* Init SpaceONE Console */
    try {
        await config.init();
        await initApiConnectorAndAuth(config);
        const domainId = await initDomain(config);
        const userId = await initUserAndToken(config);
        const mergedConfig = await mergeConfig(config, domainId);
        await APIClientManager.initialize(mergedConfig);
        initDomainSettings();
        await initModeSetting();
        await initWorkspace(userId);
        await initOpsFlowTaskManagementTemplate(mergedConfig);
        await featureSchemaManager.initialize(mergedConfig);
        initErrorHandler();
        initRouter(domainId);
        // prefetchResources();
        initI18n();
        initDayjs();
        initQueryHelper();
        initGtag(config);
        initGtm(config);
        initAmcharts5(config);
        initEcharts();
        initRequestIdleCallback();
        const results = await Promise.allSettled([
            checkSsoAccessToken(),
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
