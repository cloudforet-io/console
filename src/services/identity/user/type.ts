/* eslint-disable camelcase */
import { Tags, TimeStamp } from '@/models';

type ProtocolType = 'INTERNAL' | 'EXTERNAL';

interface Capability {
	data_type: string;
	supported_schema: string[];
}

interface PluginInfo {
	plugin_id: string;
	version: string;
	options: object;
	metadata: object;
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

export interface ChannelItem {
	user_channel_id?: string;
	project_channel_id?: string;
	user_id: string;
	name: string;
	data: object;
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
