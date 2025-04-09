import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TreeNodeIcon } from '@/data-display/tree/new-tree/type';

export const useTreeNodeIcon = (icon: Ref<TreeNodeIcon|undefined>) => {
    const iconName = computed<string>(() => {
        if (!icon.value) return '';
        if (typeof icon.value === 'string') return icon.value;
        return icon.value.iconName || '';
    });
    const iconColor = computed<string|undefined>(() => {
        if (!icon.value) return undefined;
        return typeof icon.value === 'string' ? undefined : icon.value.iconColor;
    });
    const imgUrl = computed<string>(() => {
        if (!icon.value) return '';
        return typeof icon.value === 'string' ? '' : icon.value.imgUrl || '';
    });

    return {
        iconName,
        iconColor,
        imgUrl,
    };
};
