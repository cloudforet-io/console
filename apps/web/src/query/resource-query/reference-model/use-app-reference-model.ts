import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type AppReferenceItem = ReferenceItem<AppModel>;
export type AppReferenceMap = ReferenceMap<AppReferenceItem>;

export const useAppReferenceModel = () => {
    const fetchOptions = {
        only: ['name', 'app_id'],
    };

    const {
        referenceMap,
    } = useReferenceDataModel<AppModel, AppReferenceItem>(
        RESOURCE_CONFIG_MAP.app.resourceKey,
        (appInfo: AppModel) => ({
            key: appInfo.app_id,
            label: appInfo.name,
            name: appInfo.app_id,
            data: appInfo,
        }),
        fetchOptions,
    );

    return {
        map: referenceMap,
    };
};
