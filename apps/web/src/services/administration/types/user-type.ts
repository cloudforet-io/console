import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { UserMfa } from '@/schema/identity/user/model';
import type { AuthType, UserState } from '@/schema/identity/user/type';

export interface User {
	user_id: string;
	name: string;
	email: string;
	state: UserState;
	auth_type: AuthType;
	role_type: RoleType;
	language: string;
	timezone: string;
	api_key_count?: number;
	tags: Tags;
	domain_id: string;
	created_at: TimeStamp;
	email_verified?: boolean;
	mfa?: UserMfa;
	required_actions?: string[];
	role_binding_info?: RoleBindingModel;
	last_accessed_at?: TimeStamp;
}


