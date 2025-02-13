import type { ResourceGroupType, ContentsType } from '@/api-clients/_common/schema/type';
import type { PostBoardType } from '@/schema/board/post/type';
import type { FileModel } from '@/schema/file-manager/model';

export interface PostModel {
    board_type: PostBoardType;
    contents_type: ContentsType;
    post_id: string;
    category: string;
    title: string;
    contents: string;
    options: {
        is_popup: boolean;
        is_pinned: boolean;
    };
    view_count: 0;
    writer: string;
    files: FileModel[];
    resource_group: Extract<ResourceGroupType, 'SYSTEM'|'DOMAIN'|'WORKSPACE'>;
    domain_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    workspaces: string[];
}
