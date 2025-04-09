import type { Ref } from 'vue';

export interface UseTextEllipsisOptions {
    /** Reference to the text element that needs ellipsis check */
    textEl: Ref<HTMLElement | null>;
}

export interface UseTextEllipsisReturn {
    /** Whether the text content is ellipsized */
    isEllipsis: Ref<boolean>;
}
