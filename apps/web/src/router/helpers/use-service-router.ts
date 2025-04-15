import { useRouter } from 'vue-router/composables';


import { useGlobalConfigStore } from '@/store/global-config/global-config-store';

import type { MenuId } from '@/lib/menu/config';

type RouterOptionsType = {
    feature: MenuId;
    routeKey: string;
    name?: string;
    params?: Record<string, any>;
};
type NavigateOptionsType = RouterOptionsType & {
    method: 'push' | 'replace';
};

export const useServiceRouter = () => {
    const router = useRouter();
    const globalConfigStore = useGlobalConfigStore();
    const globalConfigState = globalConfigStore.state;

    const navigate = async (options: NavigateOptionsType) => {
        const {
            feature, routeKey, params, method,
        } = options;

        const featureMetadata = globalConfigState.routeMetadataSchema[feature.toUpperCase()];
        const convertedParams = params ? transformParams(featureMetadata[routeKey].params || {}, params) : undefined;

        if (!featureMetadata) {
            return router[method]({ name: feature, params: convertedParams });
        }

        const routeConfig = featureMetadata[routeKey];
        if (!routeConfig) {
            return router[method]({ name: feature, params: convertedParams });
        }

        const navigationOptions = {
            name: routeConfig.name,
            params: convertedParams,
        };
        return router[method](navigationOptions);
    };

    const transformParams = (
        paramConfig: Record<string, any>,
        sourceParams: Record<string, any>,
    ): Record<string, any> => {
        const result: Record<string, any> = {};

        Object.entries(paramConfig).forEach(([key, targetKey]) => {
            if (sourceParams[key] !== undefined) {
                result[targetKey] = sourceParams[key];
            }
        });

        return result;
    };

    return {
        push: (options: RouterOptionsType) => navigate({ ...options, method: 'push' }),
        replace: (options: RouterOptionsType) => navigate({ ...options, method: 'replace' }),
    };
};
