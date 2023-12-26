import type { PostBoardType, PostResourceGroup } from '@/schema/board/post/type';

export interface PostCreateParameters {
    board_type: PostBoardType;
    title: string;
    contents: string;
    resource_group: PostResourceGroup;
    category?: string;
    options?: {
        is_popup: boolean;
        is_pinned: boolean;
    };
    writer?: string;
    files?: string[];
}
