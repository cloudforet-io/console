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
                <template v-if="name === 'message' && value">
                    <div v-if="value.length >= 80" class="error-message">
                        <pre class="content" :class="{ 'text-overflow': errorItemsToggleList[item.sequence - 1] }">{{ value }}</pre>
                        <div class="toggle-box">
                            <p-collapsible-toggle v-if="value.length >= 80"
                                                  :is-collapsed="errorItemsToggleList[item.sequence - 1]"
                                                  @update:isCollapsed="handleUpdateErrorItemCollapsedState(item.sequence - 1, $event)"
                            />
                        </div>
                    </div>
                    <span v-else :style="{whiteSpace: 'nowrap'}">
                        {{ value ? value : '--' }}
                    </span>
                </template>
                <template v-else-if="name === 'additional'">
                    <div class="error-location">
                        <span> {{ value.resource_type ? referenceTypeLabels[value.resource_type] : '--' }}</span>
                        <template v-if="detailErrorLocationList.includes(value.resource_type)">
                            <span> {{ value.cloud_service_group ? `> ${value.cloud_service_group}` : '' }}</span>
                            <span> {{ value.cloud_service_type ? `> ${value.cloud_service_type}` : '' }}</span>
                        </template>
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
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { JobTaskData, JobTaskError } from '@/services/asset-management/collector-history/collect-job/type';
import { referenceTypeLabels } from '@/lib/reference/type';

interface Props {
    selectedItem: JobTaskData;
}

const detailErrorLocationList = ['inventory.CloudService', 'inventory.Server'];

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
        const initErrorItemsToggleList = (): boolean[] => props.selectedItem?.errors.map(() => true);

        const state = reactive({
            errorItemsToggleList: initErrorItemsToggleList(),
            errorItems: computed<JobTaskError[]>(() => {
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
                { label: 'Error Location', name: 'additional' },
                { label: 'Error Message', name: 'message' },
                { label: 'Resource Type', name: 'additional.resource_type' },
                { label: 'Resource ID', name: 'additional.resource_id' },
                { label: 'Error Code', name: 'error_code' },
            ],
        });

        const handleUpdateErrorItemCollapsedState = (idx, isCollapsed) => {
            state.errorItemsToggleList[idx] = isCollapsed;
            state.errorItemsToggleList = [...state.errorItemsToggleList];
        };

        watch(() => props.selectedItem, () => {
            state.errorItemsToggleList = initErrorItemsToggleList();
        });

        return {
            ...toRefs(state),
            detailErrorLocationList,
            referenceTypeLabels,
            handleUpdateErrorItemCollapsedState,
        };
    },
};
</script>

<style lang="postcss" scoped>
$maxText:    79ch;

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
        width: $maxText;
        .content {
            line-height: 1.225rem;
            white-space: pre-wrap;
            &.text-overflow {
                @apply truncate;
            }
        }
    }
    .error-location {
        white-space: nowrap;
    }
}

@screen tablet {
    .toggle-box {
        @apply flex justify-center;
    }
}
</style>
