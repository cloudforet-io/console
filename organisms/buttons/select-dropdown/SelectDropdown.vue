<template>
    <PDropdownMenuBtn
        :class="invalidClass"
        :menu="items"
        @clickMenuEvent="changSelectItem"
    >
        {{ selectItemLabel }}
    </PDropdownMenuBtn>
</template>

<script>
import { computed } from '@vue/composition-api';
import PDropdownMenuBtn from '@/components/organisms/buttons/dropdown/DropdownMenuBtn';

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
    },
    setup(props, { emit }) {
        const items = computed(() => _.groupBy(props.items, 'name'));
        const selectItemLabel = computed(() => {
            const data = items.value[props.selectItem];
            console.log(items.value);
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
.is-invalid::v-deep {
    div{
         .dropdown-btn{
            border: 1px solid $alert;
        }
    }
}
</style>
