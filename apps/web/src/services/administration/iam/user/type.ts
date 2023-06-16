import VueI18n from 'vue-i18n';
import type { RouteLocation } from 'vue-router';

import type { Tags, TimeStamp } from '@/models';

import type { RoleBindingType } from '@/services/administration/type';

import TranslateResult = VueI18n.TranslateResult;

export const USER_TYPE = Object.freeze({
    API_USER: 'API_USER',
    USER: 'USER',
} as const);
export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE];

interface UserData {
	created_at: TimeStamp;
	domain_id?: string;
	email?: string;
	email_verified?: boolean;
	language: string;
	last_accessed_at: TimeStamp;
	name: string;
	state: string;
	tags?: Tags;
	timezone: string;
	user_id: string;
	backend: string;
	role_bindings?: RoleBindingType[];
}

export interface UserDetailData {
	roles?: unknown;
	tags?: Tags;
	user_id: string;
	name: string;
	state: string;
	email?: string;
	user_type: string;
	backend: string;
	language: string;
	timezone: string;
	last_accessed_at: number;
	created_at?: TimeStamp;
	domain_id: string;
	email_verified?: boolean;
}

export interface User extends UserData {
	api_key_count?: number;
	roles?: string[];
	user_type?: UserType;
}

export const USER_TYPE_LABEL = Object.freeze({
    API_USER: {
        label: 'API Only',
    },
    USER: {
        label: 'Console, API',
    },
} as const);

// export type UserTypeLabel = typeof USER_TYPE_LABEL[keyof typeof USER_TYPE_LABEL];

export const USER_STATE = Object.freeze({
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
} as const);

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
	link: Partial<RouteLocation>;
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

export const PASSWORD_TYPE = {
    KEEP: 'KEEP',
    RESET: 'RESET',
    MANUALLY: 'MANUALLY',
} as const;

export interface UserManagementData {
	user_id: string;
	name: string;
	email: string;
	tags: Tags;
	password: string;
	reset_password?: boolean;
	backend?: string;
	user_type?: string;
}
