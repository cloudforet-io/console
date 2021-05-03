<template>
    <p-check-box v-show="regex.test(item.name)"
                 :key="item.key"
                 v-model="proxySelectedKeys"
                 :value="item.key"
                 :class="{'draggable-item' :draggable}"
    >
        <span class="name">
            <template v-for="(text, i) in item.name.split(regex)">
                <strong v-if="i !== 0" :key="`${i}-match`">{{ getMatchText(item.name) }}</strong>
                <span :key="i">{{ text }}</span>
            </template>
            <span v-if="item.key.startsWith(TAGS_PREFIX)" class="ml-1 text-gray-400">{{ $t('COMMON.CUSTOM_FIELD_MODAL.TAG') }}</span>
        </span>
        <p-i name="ic_drag-handle" width="1rem" height="1rem"
             class="drag-icon"
        />
    </p-check-box>
</template>

<script lang="ts">

import { DynamicField } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { PCheckBox, PI } from '@spaceone/design-system';
import { makeProxy } from '@/lib/compostion-util';
import { TAGS_PREFIX } from '@/common/modules/custom-field-modal/config';

interface Props {
    item: DynamicField[];
    selectedKeys: string[];
    searchText: string;
    draggable: boolean;
}
export default {
    name: 'ColumnItem',
    components: {
        PI,
        PCheckBox,
    },
    model: {
        prop: 'selectedKeys',
        event: 'update:selectedKeys',
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
            validator(item) {
                return typeof item === 'object' && typeof item.name === 'string' && typeof item.key === 'string';
            },
        },
        selectedKeys: {
            type: Array,
            default: () => [],
        },
        searchText: {
            type: String,
            default: '',
        },
        draggable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            regex: computed(() => new RegExp(props.searchText || '', 'i')),
            proxySelectedKeys: makeProxy('selectedKeys', props, emit),
        });

        const getMatchText = (text: string): string => {
            const res = state.regex.exec(text);
            if (res) return res[0];
            return '';
        };

        return {
            ...toRefs(state),
            getMatchText,
            TAGS_PREFIX,
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-checkbox::v-deep {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.375rem 0.5rem;
    &:hover {
        @apply bg-blue-200;
    }
    .text {
        flex-grow: 1;
        display: inline-flex;
        align-items: center;
    }

    .check-icon {
        margin-right: 0.25rem;
        flex-shrink: 0;
    }
    .name {
        flex-grow: 1;
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
}
</style>
