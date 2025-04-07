import { computed } from 'vue';

import { useElementSize } from '@vueuse/core';

import type { UseTextEllipsisOptions } from './type';

export const useTextEllipsis = ({ textEl }: UseTextEllipsisOptions) => {
    const textElSize = useElementSize(textEl);
    const isEllipsis = computed(() => {
        const scrollWidth = textEl.value?.scrollWidth;
        const textWidth = Math.ceil(textElSize.width.value);
        return scrollWidth && scrollWidth > textWidth;
    });
    return {
        isEllipsis,
    };
};
