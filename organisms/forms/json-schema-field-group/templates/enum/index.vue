<template>
    <PSelectDropdown
        v-model="proxyValue"
        :invalid="invalid"
        :items="items"
        class="w-full"
    />
</template>

<script lang="ts">
import { computed } from '@vue/composition-api';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import { makeVModelProxy } from '@/components/util/composition-helpers';


export default {
    name: 'EnumForm',
    components: { PSelectDropdown },
    model: {
        prop: 'value',
        event: 'input',
    },
    props: {
        invalid: {
            type: Boolean,
            required: true,
        },
        schema: {
            type: Object,
            required: true,
        },
        value: {
            type: [String, Boolean, Number],
            default: undefined,
        },
    },
    setup(props, context) {
        const items = computed(() => props.schema.enum.map(val => ({ type: 'item', label: val, name: val })));
        return {
            proxyValue: makeVModelProxy(),
            items,
        };
    },
};
</script>
