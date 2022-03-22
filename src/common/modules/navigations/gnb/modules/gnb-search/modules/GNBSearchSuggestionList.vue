<template>
    <p-context-menu class="gnb-search-suggestion-list"
                    :menu="items"
    >
        <template #header-title="{ item }">
            {{ item.label }}
        </template>
        <template #item--format="{ item }">
            <p-lazy-img v-if="item.icon || item.defaultIcon"
                        :src="item.icon || ''"
                        :error-icon="item.defaultIcon"
                        width="1rem" height="1rem"
            />
            <span>
                <template v-if="item.parents">
                    <template v-for="parent in item.parents">
                        <span :key="item.name + parent.name">{{ parent.label }}</span>
                        <p-i :key="item.name + parent.name + 'arrow'" name="ic_breadcrumb_arrow" />
                    </template>
                </template>
                <span>{{ item.label }}</span>
            </span>
        </template>
    </p-context-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import {
    defineComponent, PropType,
    reactive, toRefs,
} from '@vue/composition-api';
import { PContextMenu, PI, PLazyImg } from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

export interface Item extends MenuItem {
    parents?: Item[];
    icon?: string;
    defaultIcon?: string;
}

interface Props {
    items: Item[];
    cloudServiceItems: Item[];
    inputText: string;
}

export default defineComponent<Props>({
    name: 'GNBSearchSuggestionList',
    components: {
        PContextMenu,
        PLazyImg,
        PI,
    },
    props: {
        items: {
            type: Array as PropType<Item[]>,
            default: () => [],
        },
        inputText: {
            type: String,
            default: '',
        },
    },
    setup() {
        const state = reactive({
            contextMenuRef: null as null | Vue,
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search-suggestion-list {
    @apply bg-white;
}
</style>
