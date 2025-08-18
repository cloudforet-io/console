<script setup lang="ts">
import {
    computed,
    ref, toRef, useSlots, watch,
} from 'vue';

import { debounce, reduce } from 'lodash';

import { PFieldTitle, PContextMenu, useContextMenuItems } from '@cloudforet/mirinae';
import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import type { DataSelectorItem } from '@/common/components/select/type';

const props = defineProps<{
    label?: string;
    menu?: DataSelectorItem[];
    handler?: MenuAttachHandler<DataSelectorItem>;
    showSelectMarker?: boolean;
    multiSelectable?: boolean;
    selected?: DataSelectorItem[];
}>();
const emit = defineEmits<{(e: 'update:selected', value: DataSelectorItem[]): void;
    (e: 'update:search-text', value: string): void;
}>();

const slots = useSlots();

const searchText = ref('');
const selected = ref<DataSelectorItem[]>([]);

const menuSlots = computed(() => reduce(slots, (res, d, name) => {
    if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
    return res;
}, {}));

const {
    refinedMenu,
    loading,
    initiateMenu,
    showMoreMenu,
    reloadMenu,
} = useContextMenuItems<DataSelectorItem>({
    menu: toRef(props, 'menu'),
    handler: toRef(props, 'handler'),
    selected,
    useMenuFiltering: true,
    searchText,
    pageSize: 10,
    hideHeaderWithoutItems: true,
});
const handleUpdateSearchText = debounce((text: string) => {
    searchText.value = text;
    emit('update:search-text', searchText.value);
    reloadMenu();
}, 200);

const handleUpdateSelected = (items: DataSelectorItem[]) => {
    selected.value = items;
    emit('update:selected', selected.value);
};

watch([() => props.menu, () => props.handler, () => props.selected], () => {
    if (!props.selected || props.selected?.length === 0) {
        selected.value = [];
    } else {
        selected.value = props.selected ?? [];
    }
    emit('update:selected', selected.value);
    initiateMenu();
}, { immediate: true });
</script>

<template>
    <div>
        <div class="flex flex-col gap-2">
            <p-field-title class="py-0 px-3"
                           :label="props.label"
                           required
            />
            <p-context-menu :menu="refinedMenu"
                            class="data-selector-context-menu"
                            :loading="loading"
                            :search-text="searchText"
                            searchable
                            :selected="selected"
                            :show-select-marker="props.showSelectMarker"
                            :multi-selectable="props.multiSelectable"
                            @click-show-more="showMoreMenu()"
                            @update:search-text="handleUpdateSearchText"
                            @update:selected="handleUpdateSelected"
            >
                <template #header>
                    <slot name="context-menu-header" />
                </template>
                <template #no-data-format>
                    <slot name="no-data-area" />
                </template>
                <template v-for="(_, slot) of menuSlots"
                          #[slot]="scope"
                >
                    <slot :name="`menu-${slot}`"
                          v-bind="scope"
                    />
                </template>
            </p-context-menu>
        </div>
    </div>
</template>

<style lang="postcss">
.data-selector-context-menu {
    border: none;
    min-height: 16rem;
    max-height: 360px;
    overflow-y: auto;
}
</style>
