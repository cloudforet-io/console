import { useSecretApi } from '@/api-clients/secret/secret/composables/use-secret-api';
import type { SecretModel } from '@/api-clients/secret/secret/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type SecretReferenceItem = ReferenceItem<SecretModel>;
export type SecretReferenceMap = ReferenceMap<SecretReferenceItem>;

export const useSecretReferenceDataModel = () => {
    const { secretAPI } = useSecretApi();
    const fetchConfig: ReferenceDataModelFetchConfig<SecretModel> = {
        listFetcher: secretAPI.list,
        query: {
            only: ['secret_id', 'name'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<SecretModel, SecretReferenceItem>(
        RESOURCE_CONFIG_MAP.secret.resourceKey,
        (secretInfo: SecretModel) => ({
            key: secretInfo.secret_id,
            label: secretInfo.name,
            name: secretInfo.name,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
