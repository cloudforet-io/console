import type { ResourceGroupType } from '@/schema/_common/type';
import type { PostBoardType } from '@/schema/board/post/type';
import type { FileModel } from '@/schema/file-manager/model';

export interface PostModel {
    board_type: PostBoardType;
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
    resource_group: Extract<ResourceGroupType, 'SYSTEM'|'DOMAIN'>;
    domain_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}
