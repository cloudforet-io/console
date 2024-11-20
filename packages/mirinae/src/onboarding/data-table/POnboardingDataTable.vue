<script lang="ts">
import type { PropType } from 'vue';
import {
    reactive, toRefs,
} from 'vue';

import { useProxyValue } from '@/hooks';
import { DATA_TABLE_STYLE_TYPE } from '@/onboarding/data-table/config';

const PDataTable = () => import('@/data-display/tables/data-table/PDataTable.vue');

export default {
    name: 'POnboardingDataTable',
    components: { PDataTable },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        fields: {
            type: Array,
            required: true,
        },
        items: {
            type: Array,
            required: true,
        },
        sortable: {
            type: Boolean,
            default: false,
        },
        sortBy: {
            type: String,
            default: undefined,
        },
        sortDesc: {
            type: Boolean,
            default: undefined,
        },
        colCopy: {
            type: Boolean,
            default: false,
        },
        selectable: {
            type: Boolean,
            default: false,
        },
        selectIndex: {
            type: Array,
            default: () => [],
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
        rowClickMultiSelectMode: {
            type: Boolean,
            default: false,
        },
        useCursorLoading: {
            type: Boolean,
            default: false,
        },
        tableStyleType: {
            type: String,
            default: 'default',
            validator(value: any) {
                return Object.values(DATA_TABLE_STYLE_TYPE).includes(value);
            },
        },
        tableCustomStyle: {
            type: Object as PropType<{ [key: string]: string }>,
            default: () => ({}),
        },
        striped: {
            type: Boolean,
            default: false,
        },
        bordered: {
            type: Boolean,
            default: true,
        },
        disableHover: {
            type: Boolean,
            default: false,
        },
        rowHeightFixed: {
            type: Boolean,
            default: true,
        },
        rowCursorPointer: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        getRowClassNames: {
            type: Function,
            default: undefined,
        },
        getRowSelectable: {
            type: Function,
            default: undefined,
        },
        beautifyText: {
            type: Boolean,
            default: false,
        },
        showFooter: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxySortBy: useProxyValue('sortBy', props, emit),
            proxySortDesc: useProxyValue('sortDesc', props, emit),
            proxySelectIndex: useProxyValue('selectIndex', props, emit),
            rowCursorPointer: props.rowCursorPointer,
        });

        return {
            ...toRefs(state),
        };
    },

};
</script>
<template>
    <div class="p-onboarding-table">
        <p-data-table
            :loading="loading"
            :fields="fields"
            :items="items"
            :sortable="sortable"
            :sort-desc.sync="proxySortDesc"
            :col-copy="colCopy"
            :selectable="selectable"
            :select-index.sync="proxySelectIndex"
            :multi-select="multiSelect"
            :row-click-multi-select-mode="rowClickMultiSelectMode"
            :use-cursor-loading="useCursorLoading"
            :table-style-type="tableStyleType"
            :table-custom-style="tableCustomStyle"
            :striped="striped"
            :bordered="bordered"
            :disable-hover="disableHover"
            :row-height-fixed="rowHeightFixed"
            :row-cursor-pointer="rowCursorPointer"
            :invalid="invalid"
            :get-row-class-names="getRowClassNames"
            :get-row-selectable="getRowSelectable"
            :beautify-text="beautifyText"
            :show-footer="showFooter"
        >
            <template v-for="(_, slotName) of $scopedSlots"
                      #[slotName]="scope"
            >
                <slot :name="slotName"
                      v-bind="scope"
                />
            </template>
        </p-data-table>
    </div>
</template>
<style lang="postcss">
.p-onboarding-table {
    width: 100%;
}

</style>
