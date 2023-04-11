<template>
    <span v-tooltip.bottom="invalid ? errorMessage : ''"
          class="p-tag"
          :class="{deletable: deletable, selected: selected, outline: outline, invalid: invalid}"
          v-on="$listeners"
    >
        <p-i v-if="invalid"
             class="invalid-icon"
             name="ic_error-filled"
             width="0.8rem"
             height="0.8rem"
        />
        <span class="tag-contents">
            <slot name="default">
                <span v-if="categoryItem"
                      class="category"
                ><slot name="category">[{{ categoryItem.label || categoryItem.name }}]</slot></span>
                <span v-if="keyItem"
                      class="key"
                ><slot name="key">{{ keyItem.label || keyItem.name }}:</slot></span>
                <span v-if="valueItem"
                      class="value"
                ><slot name="value">{{ valueItem.label || valueItem.name }}</slot></span>
            </slot>
        </span>
        <p-i v-if="deletable"
             name="ic_close"
             width="1rem"
             height="1rem"
             class="delete-icon"
             color="inherit"
             @click.stop="$emit('delete')"
        />
    </span>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import PI from '@/foundation/icons/PI.vue';
import type { CategoryItem, KeyItem, ValueItem } from '@/inputs/search/query-search/type';

interface Props {
    keyItem?: KeyItem;
    valueItem: ValueItem;
    categoryItem?: CategoryItem;
    deletable?: boolean;
    outline?: boolean;
    selected?: boolean;
    invalid?: boolean;
    errorMessage?: string;
}

export default defineComponent<Props>({
    name: 'PTag',
    components: {
        PI,
    },
    props: {
        keyItem: {
            type: Object as PropType<KeyItem>,
            default: undefined,
        },
        valueItem: {
            type: Object as PropType<ValueItem>,
            default: undefined,
        },
        categoryItem: {
            type: Object as PropType<CategoryItem>,
            default: undefined,
        },
        deletable: {
            type: Boolean,
            default: true,
        },
        outline: {
            type: Boolean,
            default: false,
        },
        selected: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        errorMessage: {
            type: String,
            default: '',
        },
    },
    setup() {
        return { };
    },
});
</script>

<style lang="postcss">
.p-tag {
    @apply bg-gray-200 text-gray-dark rounded;
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    padding: 0.0625rem 0.5rem 0.125rem;
    height: auto;
    max-width: 100%;
    width: fit-content;
    margin-right: 0.5rem;
    &.selected {
        @apply bg-blue-300;
    }

    &.deletable {
        padding-right: 0.25rem;
        .delete-icon {
            @apply text-gray-400;
            cursor: pointer;
            margin-top: 1px;
            flex-shrink: 0;
        }
        &:hover {
            cursor: pointer;
            .delete-icon {
                @apply text-gray-dark;
            }
        }
    }
    &.outline {
        @apply text-gray-dark bg-transparent border border-gray-200;
        &.selected {
            @apply bg-blue-200 border-blue-300;
        }
    }
    &.invalid {
        @apply bg-red-100 border border-alert;

        .invalid-icon {
            margin-right: 0.3rem;
        }
        &.selected {
            @apply bg-red-200 border-red-500;
        }
    }
    .tag-contents {
        font-size: 0.875rem;
        line-height: 1.25;
        width: 100%;
        word-break: break-all;
    }
    .category {
        font-weight: bold;
        margin-right: 0.25rem;
    }
    .key {
        font-weight: bold;
        margin-right: 0.25rem;
    }
    .value {
        white-space: pre-wrap;
        word-break: break-all;
    }
}
</style>
