import type { Tags } from '@/schema/_common/model';

export interface BoardModel {
    board_id: string;
    name: string;
    categories: string[];
    tags: Tags;
    created_at: string;
}
