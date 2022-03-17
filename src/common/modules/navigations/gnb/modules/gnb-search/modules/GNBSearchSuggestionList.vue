<template>
    <div class="gnb-search-suggestion-list">
        <p>{{ title }}</p>
        <div v-for="item in items" :key="item.name">
            <p-lazy-img v-if="showIcon" :src="item.icon || ''"
                        :error-icon="defaultIcon"
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
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, PropType,
    reactive, toRefs,
} from '@vue/composition-api';
import { PI, PLazyImg } from '@spaceone/design-system';

export interface Item {
    label: string;
    name: string;
    parents?: Item[];
    icon?: string;
}

interface Props {
    title: string;
    items: Item[];
    inputText: string;
    showIcon: boolean;
    defaultIcon: string;
}

export default defineComponent<Props>({
    name: 'GNBSearchSuggestionList',
    components: {
        PLazyImg,
        PI,
    },
    props: {
        title: {
            type: String,
            default: '',
        },
        items: {
            type: Array as PropType<Item[]>,
            default: () => [],
        },
        inputText: {
            type: String,
            default: '',
        },
        showIcon: {
            type: Boolean,
            default: false,
        },
        defaultIcon: {
            type: String,
            default: '',
        },
    },
    setup() {
        const state = reactive({});

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
