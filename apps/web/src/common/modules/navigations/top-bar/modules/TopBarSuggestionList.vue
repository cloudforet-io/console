<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch, ref,
} from 'vue';

import {
    PContextMenu, PI, PTooltip, PTextHighlighting, PLazyImg, PIconButton,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { SuggestionItem } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';
import type { FocusingDirection } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import type {
    FavoriteMenuItem,
} from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-favorite/modules/TopBarFavoriteContextMenu.vue';

interface Props {
    items: SuggestionItem[] | FavoriteMenuItem [];
    inputText?: string;
    isFocused?: boolean;
    focusingDirection?: FocusingDirection;
    useFavorite?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    inputText: '',
    isFocused: false,
    focusingDirection: undefined,
    useFavorite: false,
});

const emit = defineEmits<{(event: 'select', item: SuggestionItem, index: number): void;
    (event: 'close'): void;
    (event: 'move-focus-end', direction: FocusingDirection): void;
    (event: 'update:isFocused', value: boolean): void;
    (event: 'delete', item: SuggestionItem): void;
}>();

const contextMenuRef = ref<any|null>(null);
const state = reactive({
    refinedItems: computed(() => props.items.map((d) => ({
        ...d, icon: undefined, itemIcon: d?.icon, disabled: d?.isDeleted,
    }))),
});

const handleSelect = (item, index) => {
    emit('select', item, index);
};

watch(() => props.isFocused, (isFocused) => {
    if (!contextMenuRef.value) return;
    if (!isFocused) return;
    if (props.focusingDirection === 'DOWNWARD') {
        contextMenuRef.value.focus(0);
    } else {
        contextMenuRef.value.focus(-1);
    }
});

onUnmounted(() => {
    emit('update:isFocused', false);
});
</script>

<template>
    <p-context-menu ref="contextMenuRef"
                    class="top-bar-suggestion-list"
                    :menu="state.refinedItems"
                    no-select-indication
                    @keyup:up:end="$emit('move-focus-end', 'UPWARD')"
                    @keyup:down:end="$emit('move-focus-end', 'DOWNWARD')"
                    @keyup:esc="$emit('close')"
                    @focus="$emit('update:isFocused', true)"
                    @blur="$emit('update:isFocused', false)"
                    @select="handleSelect"
    >
        <template #header-title="{ item }">
            <div class="header-label">
                {{ item.label }}
            </div>
        </template>
        <template #item--format="{ item }">
            <p-tooltip class="suggestion-item"
                       :class="{'use-favorite': props.useFavorite, 'is-deleted': item.isDeleted}"
                       :contents="`${item.isDeleted ? `[${i18n.t('COMMON.DELETED')}] ` : ''}${item.parents ? item.parents.map(d => `${d.label} > `).join('') : ''}${item.label}`"
                       position="bottom"
            >
                <span class="image">

                    <p-lazy-img v-if="item.itemType === FAVORITE_TYPE.CLOUD_SERVICE"
                                :src="item.itemIcon || ''"
                                width="1rem"
                                height="1rem"
                    />
                    <div v-else
                         class="icon-background"
                    >
                        <p-i
                            :name="item.itemIcon"
                            width="1.25rem"
                            height="1.25rem"
                        />
                    </div>
                </span>
                <span class="texts">
                    <template v-if="item.parents">
                        <template v-for="(parent, pIdx) in item.parents">
                            <p-text-highlighting :key="`parent-${parent.label}-${pIdx}`"
                                                 class="text-item"
                                                 :term="props.inputText"
                                                 :text="parent.label"
                            />
                            <span :key="`arrow-${pIdx}`">
                                <p-i name="ic_chevron-right-thin"
                                     width="1rem"
                                     height="1rem"
                                />
                            </span>
                        </template>
                    </template>
                    <p-text-highlighting :key="`leaf-${item.label}`"
                                         class="text-item"
                                         :term="props.inputText"
                                         :text="item.label"
                    />
                </span>
                <favorite-button
                    v-if="props.useFavorite && !item.isDeleted"
                    :item-id="item.itemId"
                    :favorite-type="item.itemType"
                    scale="0.8"
                    class="favorite-button"
                />
                <p-icon-button v-if="item.isDeleted"
                               class="delete-button"
                               name="ic_close"
                               size="sm"
                               @click="$emit('delete', item)"
                />
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

<style lang="postcss" scoped>
.top-bar-suggestion-list {
    @apply bg-white border-none;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
    max-height: unset;

    .header-label {
        @apply text-gray-500;
        margin-bottom: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-weight: bold;
        font-size: 0.75rem;
        line-height: 1.5;
    }

    /* custom design-system component - p-context-menu */
    :deep(.p-context-menu) {
        .p-context-menu-item {
            justify-content: flex-start;
            line-height: 1.75;
            padding: 0.25rem 0.5rem;

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

            .icon-background {
                @apply flex items-center justify-center bg-gray-100 rounded-md;
                margin-right: 0.375rem;
                height: 1.5rem;
                width: 1.5rem;
            }
        }
        .texts {
            flex-grow: 1;
            width: 100%;
            .text-item {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                width: calc(100% - 2rem);
            }
        }
        &.use-favorite {
            .texts {
                @apply truncate;
                max-width: calc(100% - 2.75rem);
            }
            .favorite-button {
                @apply block;
                margin-right: 0.125rem;
                margin-left: auto;
                &:hover {
                    transform: scale(1.3);
                }
            }
        }
        &.is-deleted {
            svg {
                opacity: 40%;
            }
            .texts {
                @apply truncate;
                max-width: calc(100% - 2.75rem);
            }
            .delete-button {
                margin-left: auto;
            }
        }
    }
}
</style>
