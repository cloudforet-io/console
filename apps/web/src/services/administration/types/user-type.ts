
import type { UserModel } from '@/api-schema/identity/user/model';




export interface User extends UserModel {
	api_key_count?: number;
	roles?: string[];
	domain_role?: string;
	password?: string;
}


