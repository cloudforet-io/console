import type { PostBoardType, PostResourceGroup } from '@/schema/board/post/type';

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
    resource_group: PostResourceGroup;
}
