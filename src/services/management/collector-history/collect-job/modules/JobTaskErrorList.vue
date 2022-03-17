<template>
    <div class="job-task-error-list">
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
            <template #col-format="{field: { name }, item, value}">
                <template v-if="name === 'message'">
                    <div class="error-message">
                        <pre class="content" :class="{ 'text-overflow': errorItemsCollapsibleList[item.sequence - 1] }">{{ value }}</pre>
                        <p-collapsible-toggle :is-collapsed.sync="errorItemsCollapsibleList[item.sequence - 1]" />
                    </div>
                </template>
                <template v-else>
                    <span>{{ value ? value : '--' }}</span>
                </template>
            </template>
            <template #no-data-format>
                {{ $t('MANAGEMENT.COLLECTOR_HISTORY.JOB.NO_ERROR') }}
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import { PDataTable, PPanelTop, PCollapsibleToggle } from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { JobTaskData } from '@/services/management/collector-history/collect-job/type';

interface Props {
    selectedItem: JobTaskData;
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
        PCollapsibleToggle,
    },
    props: {
        selectedItem: {
            type: Object as () => JobTaskData,
            default: () => ({}),
            required: true,
        },
    },
    setup(props: Props) {
        const state = reactive({
            errorItemsCollapsibleList: props.selectedItem?.errors.map(() => true),
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
                { label: 'Error Message', name: 'message' },
                { label: 'Resource Type', name: 'additional.resource_type' },
                { label: 'Resource ID', name: 'additional.resource_id' },
                { label: 'Error Code', name: 'error_code' },
            ],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
$maxText:    80ch;

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
        @apply bg-gray-100 rounded-lg;
        padding: 0.5rem 0.75rem;
        margin: 0.75rem 0;
        .content {
            line-height: 1.225rem;
            white-space: pre-wrap;
            width: $maxText;
            &.text-overflow {
                @apply truncate;
            }
        }
    }
}
</style>
