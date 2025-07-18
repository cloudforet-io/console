import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type AppReferenceItem = ReferenceItem<AppModel>;
export type AppReferenceMap = ReferenceMap<AppReferenceItem>;

export const useAppReferenceDataModel: ReferenceDataModelImplementationAdaptor<AppReferenceItem> = () => {
    const { appAPI } = useAppApi();
    const fetchConfig: ReferenceDataModelFetchConfig<AppModel> = {
        listFetcher: appAPI.list,
        query: {
            only: ['name', 'app_id'],
        },
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
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
