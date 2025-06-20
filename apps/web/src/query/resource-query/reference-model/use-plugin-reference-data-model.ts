import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

import { assetUrlConverter } from '@/lib/helper/asset-helper';


export type PluginReferenceItem = ReferenceItem<PluginModel>;
export type PluginReferenceMap = ReferenceMap<PluginReferenceItem>;

export const usePluginReferenceDataModel = () => {
    const { pluginAPI } = usePluginApi();
    const fetchConfig: ReferenceDataModelFetchConfig<PluginModel> = {
        listFetcher: pluginAPI.list,
        query: {
            only: ['plugin_id', 'name', 'tags'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<PluginModel, PluginReferenceItem>(
        RESOURCE_CONFIG_MAP.plugin.resourceKey,
        (pluginInfo: PluginModel) => ({
            key: pluginInfo.plugin_id,
            label: pluginInfo.name,
            name: pluginInfo.name,
            icon: pluginInfo.tags.icon ? assetUrlConverter(pluginInfo.tags.icon) : '',
            description: pluginInfo.tags.description ?? '',
            link: pluginInfo.tags.link ?? '',
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
