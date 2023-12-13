import type { PostModel } from '@/schema/board/post/model';

export interface PostCreateParameters extends Pick<PostModel, 'title'|'writer'|'contents'|'options'> {
    board_id: string;
    files: string[];
    domain_id?: string|null;
}
