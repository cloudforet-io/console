import type { Tags } from '@/schema/_common/model';
import type { ProtocolPluginInfo } from '@/schema/notification/protocol/type';

export interface ProtocolCreateParameters {
    name: string;
    plugin_info: ProtocolPluginInfo;
    tags?: Tags;
}
