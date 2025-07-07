import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PluginDeregisterParameters } from '@/api-clients/repository/plugin/schema/api-verbs/deregister';
import type { PluginDisableParameters } from '@/api-clients/repository/plugin/schema/api-verbs/disable';
import type { PluginEnableParameters } from '@/api-clients/repository/plugin/schema/api-verbs/enable';
import type { PluginGetParameters } from '@/api-clients/repository/plugin/schema/api-verbs/get';
import type { PluginGetVersionsParameters } from '@/api-clients/repository/plugin/schema/api-verbs/get-versions';
import type { PluginListParameters } from '@/api-clients/repository/plugin/schema/api-verbs/list';
import type { PluginRegisterParameters } from '@/api-clients/repository/plugin/schema/api-verbs/register';
import type { PluginStatParameters } from '@/api-clients/repository/plugin/schema/api-verbs/stat';
import type { PluginUpdateParameters } from '@/api-clients/repository/plugin/schema/api-verbs/update';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';

export const usePluginApi = () => {
    const actions = {
        deregister: SpaceConnector.clientV2.repository.plugin.deregister<PluginDeregisterParameters>,
        disable: SpaceConnector.clientV2.repository.plugin.disable<PluginDisableParameters, PluginModel>,
        enable: SpaceConnector.clientV2.repository.plugin.enable<PluginEnableParameters, PluginModel>,
        get: SpaceConnector.clientV2.repository.plugin.get<PluginGetParameters, PluginModel>,
        getVersions: SpaceConnector.clientV2.repository.plugin.getVersions<PluginGetVersionsParameters, ListResponse<string>>,
        list: SpaceConnector.clientV2.repository.plugin.list<PluginListParameters, ListResponse<PluginModel>>,
        register: SpaceConnector.clientV2.repository.plugin.register<PluginRegisterParameters, PluginModel>,
        stat: SpaceConnector.clientV2.repository.plugin.stat<PluginStatParameters, any>,
        update: SpaceConnector.clientV2.repository.plugin.update<PluginUpdateParameters, PluginModel>,
    };
    return {
        pluginAPI: actions,
    };
};
