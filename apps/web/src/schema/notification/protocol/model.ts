import type { Tags } from '@/schema/_common/model';
import type { ProtocolCapability, ProtocolPluginInfo, ProtocolState } from '@/schema/notification/protocol/type';

export interface ProtocolModel {
    protocol_id: string;
    name: string;
    state: ProtocolState;
    protocol_type: string;
    resource_type: string;
    capability: ProtocolCapability;
    plugin_info: ProtocolPluginInfo;
    tags: Tags;
    domain_id: string;
    created_at: string;
}
