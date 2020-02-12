<template>
    <Fragment>
        <div class="p-dynamic-view-simple-table-header">
            <div class="title">
                {{ name }}
            </div>
            <PHr />
        </div>
        <p-data-table
            :fields="fields"
            :items="data"
            :col-copy="true"
            :striped="true"
            :bord="false"
            :padding="false"
            :hover="false"
        >
            <template v-for="slot of slots" v-slot:[slot.name]="{item}">
                <p-dynamic-field :key="slot.name" :view_type="slot.view_type" :view_option="slot.view_option"
                                 :data="getValue(item,slot.path)"
                />
            </template>
        </p-data-table>
    </Fragment>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { createComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import { Fragment } from 'vue-fragment';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PHr from '@/components/atoms/hr/Hr.vue';

interface DataSourceType {
    name:string;
    key:string;
    view_type?:string;
    view_option?:any;
}

interface Props {
    data_source: DataSourceType[];
    data: any;
    rootMode:boolean;
}

interface SlotBind {
    name:string;
    view_type:string;
    view_option:any;
    path:string[];
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
        Fragment,
        PHr,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        data_source: {
            type: Array,
            required: true,
        },
        data: {
            type: Array,
            required: true,
        },
        rootMode: {
            type: Boolean,
            default: true,
        },
    },
    setup(props:Props) {
        const fields:Ref<Field[]> = computed(():Field[] => props.data_source.map((ds:DataSourceType):Field => ({
            name: ds.key,
            label: ds.name,
        })));
        const slots:Ref<SlotBind[]> = computed(():SlotBind[] => props.data_source.map((ds:DataSourceType):SlotBind => ({
            name: `col-${ds.key}-format`,
            view_type: ds.view_type || 'text',
            view_option: ds.view_option,
            path: ds.key.split('.'),
        })));
        return {
            fields,
            slots,
            getValue: (item, path) => _.get(item, path),
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
