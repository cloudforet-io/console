import { Tags } from '@/models';

interface IdParameter {
    plugin_id: string;
}

export interface SupervisorPluginModel extends IdParameter, Tags {
    endpoint: string;
    endpoints: Array<string | undefined>;
    managed: boolean;
    // eslint-disable-next-line camelcase
    plugin_id: string;
    state: string;
    // eslint-disable-next-line camelcase
    supervisor_id: string;
    // eslint-disable-next-line camelcase
    supervisor_name: string;
    version: string;
}
