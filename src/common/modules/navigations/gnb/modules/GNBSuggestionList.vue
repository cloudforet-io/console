<template>
    <p-context-menu ref="contextMenuRef"
                    class="gnb-suggestion-list"
                    :menu="refinedItems"
                    no-select-indication
                    @keyup:up:end="$emit('move-focus-end', 'UPWARD')"
                    @keyup:down:end="$emit('move-focus-end', 'DOWNWARD')"
                    @keyup:esc="$emit('close')"
                    @focus="$emit('update:isFocused', true)"
                    @blur="$emit('update:isFocused', false)"
                    @select="handleSelect"
    >
        <template #header-title="{ item }">
            <div class="context-header">
                {{ item.label }}
            </div>
        </template>
        <template #item--format="{ item }">
            <p-tooltip class="suggestion-item"
                       :contents="`${item.parents ? item.parents.map(d => `${d.label} > `).join('') : ''}${item.label}`"
                       position="bottom"
            >
                <span class="image">
                    <p-lazy-img v-if="item.itemType === SUGGESTION_TYPE.CLOUD_SERVICE"
                                :src="item.itemIcon || ''"
                                width="1rem"
                                height="1rem"
                    />
                    <p-i v-else
                         :name="item.itemIcon"
                         width="1rem"
                         height="1rem"
                    />
                </span>
                <span class="texts">
                    <template v-if="item.parents">
                        <template v-for="(parent, pIdx) in item.parents">
                            <text-highlighting :key="`parent-${parent.label}-${pIdx}`"
                                               class="text-item"
                                               :term="inputText"
                                               :text="parent.label"
                            />
                            <span :key="`arrow-${pIdx}`">
                                <p-i name="ic_chevron-left-thin"
                                     width="1rem"
                                     height="1rem"
                                />
                            </span>
                        </template>
                    </template>
                    <text-highlighting :key="`leaf-${item.label}`"
                                       class="text-item"
                                       :term="inputText"
                                       :text="item.label"
                    />
                </span>
                <span class="favorite-button">
                    <favorite-button v-if="useFavorite"
                                     :item-id="item.name"
                                     :favorite-type="item.itemType"
                                     scale="0.65"
                    />
                </span>
            </p-tooltip>
        </template>
        <template v-for="(_, slot) of $scopedSlots"
                  #[slot]="scope"
        >
            <slot :name="slot"
                  v-bind="scope"
            />
        </template>
    </p-context-menu>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    computed,
    defineComponent, onUnmounted,
    reactive, toRefs, watch,
} from 'vue';

import {
    PContextMenu, PI, PLazyImg, PTooltip,
} from '@spaceone/design-system';

import TextHighlighting from '@/common/components/text/text-highlighting/TextHighlighting.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import type { SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import type { FocusingDirection } from '@/common/modules/navigations/gnb/modules/gnb-search/type';

interface Props {
    items: SuggestionItem[];
    inputText: string;
    isFocused: boolean;
    focusingDirection: FocusingDirection;
    useFavorite: boolean;
}

export default defineComponent<Props>({
    name: 'GNBSuggestionList',
    components: {
        TextHighlighting,
        FavoriteButton,
        PContextMenu,
        PLazyImg,
        PI,
        PTooltip,
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
        focusingDirection: {
            type: String as PropType<FocusingDirection>,
            default: undefined,
        },
        useFavorite: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            contextMenuRef: null as null | any,
            refinedItems: computed(() => props.items.map((d) => ({ ...d, icon: undefined, itemIcon: d.icon }))),
        });

        const handleSelect = (item, index) => {
            emit('select', item, index);
        };

        watch(() => props.isFocused, (isFocused) => {
            if (!state.contextMenuRef) return;
            if (!isFocused) return;
            if (props.focusingDirection === 'DOWNWARD') {
                state.contextMenuRef.focus(0);
            } else {
                state.contextMenuRef.focus(-1);
            }
        });

        onUnmounted(() => {
            emit('update:isFocused', false);
        });

        return {
            ...toRefs(state),
            SUGGESTION_TYPE,
            handleSelect,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-suggestion-list {
    @apply bg-white border-none;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-bottom: 0.125rem;
    max-height: unset;

    /* custom design-system component - p-context-menu */
    :deep() {
        .context-header {
            margin-top: 0;
            margin-bottom: 0.25rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }

        .p-context-menu-item {
            justify-content: flex-start;
            line-height: 1.75;
            padding: 0.25rem 0.5rem;
            .label-wrapper {
                overflow: visible;
            }

            &:focus {
                @apply border border-blue-400 rounded-xs;
                box-shadow: 0 0 0 0.125rem rgba(73, 167, 247, 0.2);
                outline: none;

                &:not(:hover):not(.disabled):not(.empty) {
                    @apply bg-white;
                }
            }
        }

        .context-divider {
            margin: 0.875rem 0 1rem;
        }

        .matched-character {
            @apply text-blue-700 bg-blue-200;
        }
    }

    .suggestion-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .image {
            margin-right: 0.25rem;
            flex-shrink: 0;
        }
        .texts {
            display: flex;
            flex-grow: 1;
            .text-item {
                max-width: 10rem;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        .favorite-button {
            flex-shrink: 0;
        }
    }
}
</style>
