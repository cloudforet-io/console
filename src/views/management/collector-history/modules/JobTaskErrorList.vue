<template>
    <div>
        <p-panel-top :use-total-count="true" :total-count="errorItems.length">
            {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.ERROR_LIST') }}
        </p-panel-top>
        <p-data-table :fields="errorFields"
                      :items="errorItems"
                      :sortable="false"
                      :selectable="false"
                      :row-height-fixed="false"
                      table-style-type="light"
                      bordered
        >
            <template #col-message-format="{ value }" style="width: 20rem;">
                <div class="error-message">
                    {{ value.replace(/\'/g, '') }}
                </div>
            </template>
            <template #no-data-format>
                {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.NO_DATA') }}
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import { PDataTable, PPanelTop } from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

interface Props {
    selectedItem: any;
}

export default {
    name: 'JobTaskErrorList',
    components: {
        PDataTable,
        PPanelTop,
    },
    props: {
        selectedItem: {
            type: Object,
            default: () => ({}),
            required: true,
        },
    },
    setup(props: Props) {
        const state = reactive({
            errorItems: computed(() => {
                if (Array.isArray(props?.selectedItem?.errors)) {
                    return props.selectedItem.errors.map((d, idx) => ({
                        sequence: idx + 1,
                        ...d,
                    }));
                }
                return [];
            }),
            errorFields: [
                { label: 'No.', name: 'sequence' },
                { label: 'Error Code', name: 'error_code' },
                { label: 'Error Message', name: 'message' },
                { label: 'Resource Type', name: 'additional.resource_type' },
                { label: 'Resource ID', name: 'additional.resource_id' },
            ],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-data-table {
    th {
        border-top: none;
    }
    tr:hover {
        @apply bg-gray-100;
    }
    td {
        @apply border-gray-200;
    }
    .th-contents {
        @apply text-gray-500;
    }
    .error-message {
        /* white-space: nowrap; */

        /* overflow: hidden; */

        /* text-overflow: ellipsis; */
    }
}
</style>
