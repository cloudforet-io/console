import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import { useRoute, useRouter } from 'vue-router/composables';

import type { TreeNodeEmit, TreeNodeLink } from '@/data-display/tree/new-tree/type';

export const useTreeNodeSelect = ({
    selectable, link, selected,
}: {
    selectable: Ref<boolean>;
    link: Ref<TreeNodeLink|undefined>;
    selected: Ref<boolean>;
}, emit: TreeNodeEmit) => {
    const router = useRouter();
    const route = useRoute();

    const isLinkMatched = computed<boolean>(() => {
        if (!selectable.value) return false;
        if (!link.value?.to) return false;

        if (link.value?.predicate) {
            return link.value.predicate(link.value.to, route);
        }

        const resolved = router.resolve(link.value.to);
        if (!resolved) return false;

        let currentPath = route.fullPath;
        if (currentPath.indexOf('?') > 0) {
            currentPath = currentPath.slice(0, currentPath.indexOf('?'));
        }
        const resolvedHref = resolved.href;
        return currentPath === resolvedHref;
    });

    const target = computed<string>(() => (link.value?.openNewTab ? '_blank' : '_self'));

    const to = computed(() => link.value?.to);

    const isSelected = ref(selected.value || isLinkMatched.value);
    watch(selected, (value) => {
        isSelected.value = value;
    });
    watch(isLinkMatched, (value) => {
        isSelected.value = value;
    });
    watch(isSelected, (value) => {
        emit('update:selected', value);
    });

    return {
        isSelected,
        target,
        to,
    };
};
