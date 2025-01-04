import type { ResourceGroupType } from '@/schema/_common/type';

export type FileManagerResourceGroupType = Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>|'USER'|'PUBLIC';
