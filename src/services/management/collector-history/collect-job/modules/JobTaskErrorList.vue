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
                    <pre>{{ value }}</pre>
                </div>
            </template>
            <template #no-data-format>
                {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.NO_ERROR') }}
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

const errorMessageFormatter = (message) => {
    let result = message
        .replace(/'/g, '')
        .replace(/(\\r\\n|\\n|\\r)/gm, '\n')
        .replace(/(\\t)/gm, '');
    if (result.startsWith('\n')) result = result.replace('\n', '');
    return result;
};

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
                        ...d,
                        sequence: idx + 1,
                        message: errorMessageFormatter(d.message),
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
        @apply bg-gray-100;
        white-space: pre-wrap;
        border-radius: 0.375rem;
        padding: 0.5rem 0.75rem;
        margin: 0.75rem 0;
    }
}
</style>
