import { useProtocolApi } from '@/api-clients/notification/protocol/composables/use-protocol-api';
import type { ProtocolModel } from '@/api-clients/notification/protocol/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

export type ProtocolReferenceItem = ReferenceItem<ProtocolModel>;
export type ProtocolReferenceMap = ReferenceMap<ProtocolReferenceItem>;

export const useProtocolReferenceDataModel = () => {
    const { protocolAPI } = useProtocolApi();
    const fetchConfig: ReferenceDataModelFetchConfig<ProtocolModel> = {
        listFetcher: protocolAPI.list,
        query: {
            only: ['protocol_id', 'name'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<ProtocolModel, ProtocolReferenceItem>(
        RESOURCE_CONFIG_MAP.protocol.resourceKey,
        (protocolInfo: ProtocolModel) => ({
            key: protocolInfo.protocol_id,
            label: protocolInfo.name,
            name: protocolInfo.name,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
