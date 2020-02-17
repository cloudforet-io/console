<template>
    <p-data-table
        :fields="fields"
        :items="items"
        :col-copy="true"
        :striped="true"
        :bord="false"
        :padding="false"
        :hover="false"
    >
        <template v-for="slot of slots" v-slot:[slot.name]="{value}">
            <p-dynamic-field :key="slot.key" v-bind="slot" :data="value" />
        </template>
    </p-data-table>
</template>

<script lang="ts">
import { createComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';

interface DataSourceType {
    name:string;
    key:string;
    // eslint-disable-next-line camelcase
    view_type?:string;
    // eslint-disable-next-line camelcase
    view_option?:any;
}

interface Props {
    // eslint-disable-next-line camelcase
    data_source: DataSourceType[];
    data: any;
    // eslint-disable-next-line camelcase
    key_path:string;
}

interface Field {
    name:string;
    label:string;
}


export default createComponent({
    name: 'PDynamicViewSimpleTable',
    components: {
        PDynamicField,
        PDataTable,
    },
    props: {
        // eslint-disable-next-line camelcase
        data_source: {
            type: Array,
            required: true,
        },
        data: {
            type: [Array, Object],
            required: true,
        },
        // eslint-disable-next-line camelcase
        key_path: {
            type: String,
            default: '',
        },
    },
    setup(props:Props) {
        const fields:Ref<Readonly<Field[]> > = computed(():Field[] => props.data_source.map((ds:DataSourceType):Field => ({
            name: ds.key,
            label: ds.name,
        })));
        const items = computed(() => (props.key_path ? _.get(props.data, props.key_path) : props.data));

        const slots:Ref<Readonly<DataSourceType[]>> = computed(():DataSourceType[] => props.data_source.map((ds:DataSourceType):DataSourceType => ({
            ...ds,
            name: `col-${ds.key}-format`,
        })));
        return {
            fields,
            slots,
            items,
        };
    },
});
</script>

<style scoped lang="scss">
    .p-dynamic-view-simple-table-header{
        margin-bottom: 1rem;
        .title{
            display: flex;
            text-align: left;
            font:  18px Arial;
            letter-spacing: 0;
            color: #202433;
            opacity: 1;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            align-self:center;
        }
    }

</style>
