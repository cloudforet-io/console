
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import type { Tags, TimeStamp } from '@/api-schema/common/model';


type ProtocolType = 'INTERNAL' | 'EXTERNAL';

type MetadataDataType = 'PLAIN_TEXT' | 'SECRET';

interface Capability {
    data_type?: string;
    supported_schema: string[];
}

interface Metadata {
    data?: {
        schema: any;
    };
    data_type: MetadataDataType;
}
interface PluginInfo {
    plugin_id: string;
    version: string;
    options: any;
    secret_id?: string;
    upgrade_mode?: string;
    metadata: Metadata;
}

export interface ProtocolItem {
    capability: Capability;
    name: string;
    plugin_info: PluginInfo;
    protocol_id: string;
    protocol_type: ProtocolType;
    resource_type: string;
    state: string;
    tags: Tags;
    created_at: TimeStamp;
}

export interface EnrichedProtocolItem extends ProtocolItem {
    label: TranslateResult;
    link: Partial<Location>;
    protocolType: string;
    tags: Tags;
    icon: any;
}


export interface ChannelItem {
    user_channel_id?: string;
    project_channel_id?: string;
    user_id: string;
    name: string;
    data: any;
    is_subscribe: boolean;
    protocol_id: string;
    schedule: string[];
    schema: string;
    secret_id: string;
    state: string;
    subscriptions: string[];
    tags: Tags;
    created_at: TimeStamp;
    notification_level?: string;
    protocol_name: string;
}

