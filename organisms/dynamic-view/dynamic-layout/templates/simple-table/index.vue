<template>
    <div>
        <p-panel-top>{{ name }}</p-panel-top>
        <p-data-table :items="items" :fields="fields" v-on="$listeners">
            <template v-for="slot of slots" v-slot:[slot.name]="{value}">
                <p-dynamic-field :key="slot.key" v-bind="slot" :data="value" />
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import {
    DynamicLayoutProps,
    makeFields, makeTableSlots,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';


export default defineComponent({
    name: 'PDynamicLayoutSimpleTable',
    components: {
        PDynamicField,
        PDataTable,
        PPanelTop,

    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, Array],
            default: null,
        },
    },
    setup(props: DynamicLayoutProps) {
        const fields = makeFields(props);
        const items = computed(() => (props.options.root_path ? _.get(props.data, props.options.root_path) : props.data));
        const slots = makeTableSlots(props);
        return {
            fields,
            slots,
            items,
        };
    },
});
</script>
