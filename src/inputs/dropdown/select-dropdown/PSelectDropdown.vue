<template>
    <p-dropdown-menu-btn
        class="p-select-dropdown"
        :class="invalidClass"
        :menu="items"
        :auto-height="autoHeight"
        :disabled="disabled"
        :loading="loading"
        @select="changSelectItem"
        @openMenu="$emit('openMenu')"
    >
        {{ selectItemLabel }}
    </p-dropdown-menu-btn>
</template>

<script lang="ts">
import { groupBy } from 'lodash';
import { computed } from '@vue/composition-api';
import PDropdownMenuBtn from '@/inputs/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import { SelectDropdownProps } from '@/inputs/dropdown/select-dropdown/type';

export default {
    name: 'PSelectDropdown',
    components: { PDropdownMenuBtn },
    model: {
        prop: 'selectItem',
    },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        selectItem: {
            type: [String, Number],
            required: true,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        autoHeight: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        indexMode: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: '',
        },
    },
    setup(props: SelectDropdownProps, { emit }) {
        const selectItemLabel = computed(() => {
            if (props.indexMode) {
                if (props.items[props.selectItem]) return props.items[props.selectItem].label || props.items[props.selectItem].name || '';
                return props.placeholder;
            }
            const data = groupBy(props.items, 'name')[props.selectItem];
            if (Array.isArray(data)) {
                return data[0].label || data[0].name || '';
            }
            return props.placeholder;
        });
        const changSelectItem = (value, index) => {
            if (props.indexMode) {
                emit('input', index);
                emit('onSelected', index);
            } else {
                emit('input', value);
                emit('onSelected', value);
            }
        };
        const invalidClass = computed(() => ({ 'is-invalid-btn': props.invalid }));
        return {
            selectItemLabel,
            changSelectItem,
            invalidClass,
        };
    },
};
</script>

<style lang="postcss">
.p-select-dropdown {
    &.is-invalid-btn .p-dropdown-btn {
        .menu-btn.p-button {
            @apply border border-alert;
        }
        .p-icon-button.p-button, .p-icon-button.p-button.active, .p-icon-button.p-button.hovered {
            @apply border border-alert;
        }
    }
    .p-dropdown-btn .menu-btn.p-button.active {
        @apply text-gray-900;
    }
}
</style>
