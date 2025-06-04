import type { Tags } from '@/api-clients/_common/schema/model';
import type { ProtocolPluginInfo } from '@/schema/notification/protocol/type';

export interface ProtocolCreateParameters {
    name: string;
    plugin_info: ProtocolPluginInfo;
    tags?: Tags;
}
