<template>
    <span v-show="regex.test(item.name)"
          :key="item.key"
          class="column-item"
          :class="{'draggable-item' :proxySelectedKeys.includes(item.key)}"
    >
        <p-check-box v-model="proxySelectedKeys"
                     :value="item.key"
        >
            <p-text-highlighting :text="item.name"
                                 :term="searchText"
                                 style-type="secondary"
            />
            <span v-if="item.options && item.options.field_description"
                  class="ml-1 text-gray-400"
            >{{ item.options.field_description }}</span>
        </p-check-box>
        <p-i name="ic_drag-handle"
             width="1rem"
             height="1rem"
             class="drag-icon"
        />

    </span>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import {
    PCheckBox, PI, PTextHighlighting, getTextHighlightRegex,
} from '@spaceone/design-system';
import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';

import { useProxyValue } from '@/common/composables/proxy-state';
import { TAGS_PREFIX } from '@/common/modules/custom-table/custom-field-modal/config';

interface Props {
    item: DynamicField[];
    selectedKeys: string[];
    searchText: string;
}
export default defineComponent<Props>({
    name: 'ColumnItem',
    components: {
        PI,
        PCheckBox,
        PTextHighlighting,
    },
    model: {
        prop: 'selectedKeys',
        event: 'update:selectedKeys',
    },
    props: {
        item: {
            type: Object as PropType<DynamicField>,
            default: () => ({}),
            validator(item: DynamicField) {
                return typeof item === 'object' && typeof item.name === 'string' && typeof item.key === 'string';
            },
        },
        selectedKeys: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
        searchText: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            regex: computed(() => getTextHighlightRegex(props.searchText)),
            proxySelectedKeys: useProxyValue('selectedKeys', props, emit),
        });


        return {
            ...toRefs(state),
            TAGS_PREFIX,
        };
    },
});
</script>

<style lang="postcss" scoped>
.column-item {
    display: flex;
    width: 100%;
    align-items: center;
    cursor: pointer;
    padding: 0.375rem 0.5rem;

    @media (hover: hover) {
        &:hover {
            @apply bg-blue-200;
        }
    }

    /* custom design-system component - p-checkbox */
    .p-checkbox:deep() {
        flex-grow: 1;
        display: inline-flex;
        align-items: center;
        .check-icon {
            margin-right: 0.25rem;
            flex-shrink: 0;
        }
        .text {
            display: inline-flex;
        }
    }

    .drag-icon {
        flex-shrink: 0;
        display: none;
    }

    &.draggable-item {
        .drag-icon {
            display: inline-block;
        }
    }
    &.ghost {
        @apply border border-secondary;
        opacity: 0.5;
    }
}
</style>
