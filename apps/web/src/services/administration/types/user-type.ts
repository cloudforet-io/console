import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

export type UserListItemType = Partial<WorkspaceUserModel> & Partial<UserModel>;
