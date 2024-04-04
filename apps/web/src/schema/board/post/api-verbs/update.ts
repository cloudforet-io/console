export interface PostUpdateParameters {
    post_id: string;
    title?: string;
    contents?: string;
    category?: string;
    files?: string[];
    options?: {
        is_popup: boolean;
        is_pinned: boolean;
    };
    writer?: string;
}
