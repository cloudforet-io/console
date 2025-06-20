import { useTrustedAccountApi } from '@/api-clients/identity/trusted-account/composables/use-trusted-account-api';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';



export type TrustedAccountReferenceItem = ReferenceItem<TrustedAccountModel>;
export type TrustedAccountReferenceMap = ReferenceMap<TrustedAccountReferenceItem>;

export const useTrustedAccountReferenceDataModel = () => {
    const { trustedAccountAPI } = useTrustedAccountApi();
    const fetchConfig: ReferenceDataModelFetchConfig<TrustedAccountModel> = {
        listFetcher: trustedAccountAPI.list,
        query: {
            only: ['trusted_account_id', 'name', 'resource_group', 'schedule'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<TrustedAccountModel, TrustedAccountReferenceItem>(
        RESOURCE_CONFIG_MAP.trustedAccount.resourceKey,
        (trustedAccountInfo: TrustedAccountModel) => ({
            key: trustedAccountInfo.trusted_account_id,
            label: trustedAccountInfo.name,
            name: trustedAccountInfo.name,
            data: trustedAccountInfo,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
