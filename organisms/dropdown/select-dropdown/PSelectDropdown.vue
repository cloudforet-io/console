<template>
    <PDropdownMenuBtn
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
    </PDropdownMenuBtn>
</template>

<script lang="ts">
import { computed } from '@vue/composition-api';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import {
    SelectDropdownProps,
    selectDropdownProps,
} from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.toolset';
import _ from 'lodash';

export default {
    name: 'PSelectDropdown',
    components: { PDropdownMenuBtn },
    model: {
        prop: 'selectItem',
    },
    props: selectDropdownProps,
    setup(props: SelectDropdownProps, { emit }) {
        const items = computed(() => _.groupBy(props.items, 'name'));
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
