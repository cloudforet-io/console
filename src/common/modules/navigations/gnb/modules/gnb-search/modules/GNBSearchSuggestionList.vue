<template>
    <p-context-menu ref="contextMenuRef"
                    class="gnb-search-suggestion-list"
                    :menu="items"
                    @keyup:up:end="$emit('move-focus-end')"
                    @keyup:down:end="$emit('move-focus-end')"
                    @keyup:esc="$emit('close')"
                    @focus="$emit('update:isFocused', true)"
                    @blur="$emit('update:isFocused', false)"
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
import {
    defineComponent, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PContextMenu, PI, PLazyImg } from '@spaceone/design-system';
import {
    focusStartPositions,
    FocusStartPosition,
    SuggestionItem,
} from '@/common/modules/navigations/gnb/modules/gnb-search/config';


interface Props {
    items: SuggestionItem[];
    cloudServiceSuggestionItems: SuggestionItem[];
    inputText: string;
    isFocused: boolean;
    focusStartPosition: FocusStartPosition;
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
            type: Array as PropType<SuggestionItem[]>,
            default: () => [],
        },
        inputText: {
            type: String,
            default: '',
        },
        isFocused: {
            type: Boolean,
            default: false,
        },
        focusStartPosition: {
            type: String as PropType<FocusStartPosition>,
            default: 'START',
            validator(position: FocusStartPosition) {
                return focusStartPositions.includes(position);
            },
        },
    },
    setup(props) {
        const state = reactive({
            contextMenuRef: null as null | any,
        });

        watch(() => props.isFocused, (isFocused) => {
            if (!state.contextMenuRef) return;
            if (!isFocused) return;
            if (props.focusStartPosition === 'START') {
                state.contextMenuRef.focus(0);
            } else {
                state.contextMenuRef.focus(-1);
            }
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
