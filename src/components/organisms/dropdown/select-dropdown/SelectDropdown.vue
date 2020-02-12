<template>
    <PDropdownMenuBtn
        class="p-select-dropdown"
        :class="invalidClass"
        :menu="items"
        :auto-height="autoHeight"
        @clickMenuEvent="changSelectItem"
    >
        {{ selectItemLabel }}
    </PDropdownMenuBtn>
</template>

<script>
import { computed } from '@vue/composition-api';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';

export default {
    name: 'PSelectDropdown',
    components: { PDropdownMenuBtn },
    model: {
        prop: 'selectItem',
    },
    props: {
        items: {
            type: Array,
        },
        selectItem: {
            type: String,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        autoHeight: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
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
        };
        const invalidClass = computed(() => ({ 'is-invalid': props.invalid }));
        return {
            selectItemLabel,
            changSelectItem,
            invalidClass,
        };
    },
};
</script>

<style lang="scss" scoped>
.p-select-dropdown::v-deep{
    &.is-invalid{
        div{
            .dropdown-btn{
                border: 1px solid $alert;
            }
        }
    }
    div{
        width: 100%;
        .dropdown-btn{
            width: 100%;
        }
    }
}
</style>
