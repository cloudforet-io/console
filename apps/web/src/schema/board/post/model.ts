import type { PostBoardType, PostResourceGroup } from '@/schema/board/post/type';
import type { FileModel } from '@/schema/file-manager/model';

export interface PostModel {
    post_id: string;
    board_type: PostBoardType;
    category: string;
    title: string;
    contents: string;
    files: FileModel[];
    options: {
        is_popup: boolean;
        is_pinned: boolean;
    };
    view_count: 0;
    writer: string;
    resource_group: PostResourceGroup;
    domain_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}
