import type { Ref } from 'vue';
import { computed } from 'vue';

import { useElementSize } from '@vueuse/core';

interface UseTreeNodeTextEllipsisOptions {
  textEl: Ref<HTMLElement | null>;
}
export const useTextEllipsis = ({ textEl }: UseTreeNodeTextEllipsisOptions) => {
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
