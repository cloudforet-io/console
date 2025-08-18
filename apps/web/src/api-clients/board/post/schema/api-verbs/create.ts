import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { PostBoardType } from '@/api-clients/board/post/schema/type';

export interface PostCreateParameters {
    board_type: PostBoardType;
    title: string;
    contents: string;
    category?: string;
    files?: string[];
    options?: {
        is_popup: boolean;
        is_pinned: boolean;
    };
    writer?: string;
    resource_group: Extract<ResourceGroupType, 'SYSTEM'|'DOMAIN'|'WORKSPACE'>;
    workspaces?: string[];
}
