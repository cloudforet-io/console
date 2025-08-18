import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { GetPluginEndpointParameters, GetPluginEndpointResponse } from '@/api-clients/plugin/plugin/api-verbs/get-plugin-endpoint';
import type { GetPluginMetadataParameters, GetPluginMetadataResponse } from '@/api-clients/plugin/plugin/api-verbs/get-plugin-metadata';

export const usePluginApi = () => {
    const actions = {
        getPluginEndpoint: SpaceConnector.clientV2.plugin.plugin.getPluginEndpoint<GetPluginEndpointParameters, GetPluginEndpointResponse>,
        getPluginMetadata: SpaceConnector.clientV2.plugin.plugin.getPluginMetadata<GetPluginMetadataParameters, GetPluginMetadataResponse>,
    };
    return {
        pluginAPI: actions,
    };
};
