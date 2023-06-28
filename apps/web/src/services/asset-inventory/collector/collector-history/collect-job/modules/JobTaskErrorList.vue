<script lang="ts" setup>
import { PDataTable, PHeading, PCollapsibleToggle } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { resourceTypeLabels } from '@/lib/reference/type';

import type { JobTaskData, JobTaskError } from '@/services/asset-inventory/collector/collector-history/collect-job/type';

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

const props = withDefaults(defineProps<Props>(), {
    selectedItem: () => ({}) as JobTaskData,
});
const { t } = useI18n();

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

</script>

<template>
    <div class="job-task-error-list">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.errorItems.length"
                   :title="t('MANAGEMENT.COLLECTOR_HISTORY.JOB.ERROR_LIST')"
        />
        <p-data-table :fields="state.errorFields"
                      :items="state.errorItems"
                      :sortable="false"
                      :selectable="false"
                      :row-height-fixed="false"
                      table-style-type="light"
                      bordered
        >
            <template #col-format="{field: { name }, item, value}">
                <template v-if="name === 'message' && value">
                    <div v-if="value.length >= 80"
                         class="error-message"
                    >
                        <pre class="content"
                             :class="{ 'text-overflow': state.errorItemsToggleList[item.sequence - 1] }"
                        >{{ value }}</pre>
                        <div class="toggle-box">
                            <p-collapsible-toggle v-if="value.length >= 80"
                                                  :is-collapsed="state.errorItemsToggleList[item.sequence - 1]"
                                                  @update:is-collapsed="handleUpdateErrorItemCollapsedState(item.sequence - 1, $event)"
                            >
                                {{ state.errorItemsToggleList[item.sequence - 1] ? t('COMMON.MONITORING.MORE') : t('COMPONENT.COLLAPSIBLE_TOGGLE.HIDE') }}
                            </p-collapsible-toggle>
                        </div>
                    </div>
                    <pre v-else
                         class="short-error-message"
                    >{{ value ? value : '--' }}</pre>
                </template>
                <template v-else-if="name === 'additional'">
                    <div class="error-location">
                        <span> {{ value.resource_type ? resourceTypeLabels[value.resource_type] : '--' }}</span>
                        <template v-if="detailErrorLocationList.includes(value.resource_type)">
                            <span> {{ value.cloud_service_group ? `> ${value.cloud_service_group}` : '' }}</span>
                            <span> {{ value.cloud_service_type ? `> ${value.cloud_service_type}` : '' }}</span>
                        </template>
                    </div>
                </template>
                <template v-else-if="name === 'additional.resource_id'">
                    <div class="resource-id">
                        {{ value ? value : '--' }}
                    </div>
                </template>
                <template v-else>
                    <span>{{ value ? value : '--' }}</span>
                </template>
            </template>
            <template #no-data-format>
                {{ t('MANAGEMENT.COLLECTOR_HISTORY.JOB.NO_ERROR') }}
            </template>
        </p-data-table>
    </div>
</template>

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
        @apply flex items-end;
        margin: 0.625rem 0;
        .content {
            width: $maxText;
            line-height: 1.225rem;
            white-space: pre-wrap;
            &.text-overflow {
                @apply truncate;
                height: 1.225rem;
                white-space: pre;
            }
        }
        .toggle-box {
            width: 2.625rem;

            /* custom design-system component - p-collapsible-toggle */
            :deep(.p-collapsible-toggle) {
                span {
                    @apply flex;
                }
            }
        }
    }
    .short-error-message {
        line-height: 1.225rem;
    }
    .error-location {
        white-space: nowrap;
    }
    .resource-id {
        @apply truncate;
        width: 13.6875rem;
    }
}

@screen tablet {
    .toggle-box {
        @apply flex justify-center;
    }
}
</style>
