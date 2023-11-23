import type { UserModel } from '@/schema/inventory/job-task/model';


export interface User extends UserModel {
	api_key_count?: number;
	roles?: string[];
	domain_role?: string;
	password?: string;
}


