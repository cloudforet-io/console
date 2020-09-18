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
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import { SelectDropdownProps } from '@/components/organisms/dropdown/select-dropdown/type';

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
    },
    setup(props: SelectDropdownProps, { emit }) {
        const items = computed(() => groupBy(props.items, 'name'));
        const selectItemLabel = computed(() => {
            const data = items.value[props.selectItem];
            if (data && data[0].label) {
                return data[0].label;
            }
            return '';
        });
        const changSelectItem = (value) => {
            emit('input', value);
            emit('onSelected', value);
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

<style lang="postcss" scoped>
.p-select-dropdown::v-deep {
    div {
        width: 100%;
        .dropdown-btn {
            width: 100%;
        }
    }
    &.is-invalid-btn {
        div {
            .dropdown-btn {
                @apply border border-alert;
            }
        }
    }
}
</style>
