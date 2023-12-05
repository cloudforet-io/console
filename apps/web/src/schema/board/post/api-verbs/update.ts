import type { PostModel } from '@/schema/board/post/model';

export interface PostUpdateParameters extends Pick<PostModel, 'title'|'writer'|'contents'|'options'> {
    board_id: string;
    post_id: string;
    files: string[];
    domain_id?: string|null;
}
