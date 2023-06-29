<script lang="ts" setup>


import { iso8601Formatter } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PToolboxTable, PSelectDropdown, PTableCheckModal, PHeading,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';
import { debounce, get } from 'lodash';
import {
    reactive, computed, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CollectorModel } from '@/services/asset-inventory/collector/model';
import EditScheduleModal from '@/services/asset-inventory/collector/modules-old/EditScheduleModal.vue';


interface Props {
    collector: CollectorModel;
    manageDisabled: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    collector: () => ({}) as CollectorModel,
    manageDisabled: false,
});
const store = useStore();
const { t } = useI18n();

const state = reactive({
    timezone: computed(() => store.state.user.timezone),
    totalCount: 0,
    items: [],
    selectIndex: [],
    editVisible: false,
    deleteVisible: false,
    supportedSchedules: computed(() => get(props.collector, 'plugin_info.metadata.supported_schedules')),
    dropdown: computed<MenuItem[]>(() => [
        {
            name: 'update', label: t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_UPDATE'), disabled: state.selectIndex.length !== 1,
        },
        {
            name: 'delete', label: t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_DELETE'), disabled: state.selectIndex.length === 0,
        },
    ]),
    multiItems: computed(() => state.selectIndex.map((idx) => state.items[idx])),
    multiFields: [
        { name: 'schedule_id', label: 'ID' },
        { name: 'name', label: 'Name' },
    ] as DataTableField[],
    isEditMode: false,
});
const tableState = reactive({
    loading: true,
    fields: [
        { name: 'schedule_id', label: 'ID' },
        { name: 'name', label: 'Name' },
        {
            name: 'schedule', label: 'Schedule', sortable: false, width: '25rem',
        },
        { name: 'created_at', label: 'Created' },
    ] as DataTableField[],
    sortBy: '',
    sortDesc: '',
    pageSize: 10,
    thisPage: 1,
    allPage: computed(() => Math.ceil(state.totalCount / tableState.pageSize) || 1),
});

const timezone = store.state.user.timezone || 'UTC';
const getTimezoneHours = (hours) => {
    const timezoneHours = hours.map((hour) => {
        let newHour = dayjs().utc().hour(hour);
        if (timezone !== 'UTC') {
            newHour = newHour.tz(timezone);
        }
        return newHour.format('HH:00');
    });
    return timezoneHours.join(', ');
};
const intervalFormatter = (interval) => {
    if (interval < 60) {
        return `${interval} sec`;
    } if (interval >= 60 && interval < 3600) {
        if (interval % 60 === 0) {
            return `${Math.trunc(interval / 60)} min`;
        }
        return `${interval} sec`;
    }
    return `${Math.trunc(interval / 3600)} hour`;
};

const openEditModal = (editMode: boolean) => {
    state.isEditMode = editMode;
    state.editVisible = true;
};

const onSelectDropdown = (name) => {
    switch (name) {
    case 'update': openEditModal(true); break;
    case 'delete': state.deleteVisible = true; break;
    default: break;
    }
};

const apiQuery = new ApiQueryHelper();
const listSchedules = debounce(async (): Promise<void> => {
    tableState.loading = true;
    state.selectIndex = [];
    state.totalCount = 0;
    try {
        apiQuery.setSort(tableState.sortBy, tableState.sortDesc)
            .setPage(getPageStart(tableState.thisPage, tableState.pageSize), tableState.pageSize);

        const res = await SpaceConnector.client.inventory.collector.schedule.list({
            collector_id: props.collector.collector_id,
            query: apiQuery.data,
        });
        state.items = res.results;
        state.totalCount = res.total_count;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        tableState.loading = false;
    }
}, 200);

const onConfirmDelete = async () => {
    try {
        await SpaceConnector.client.inventory.collector.schedule.delete({
            collector_id: props.collector.collector_id,
            schedule_id: state.items[state.selectIndex[0]].schedule_id,
        });
        showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_DELETE_SCHEDULE_TITLE', 1), '');
        await listSchedules();
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_DELETE_SCHEDULE_TITLE', 1));
    } finally {
        state.deleteVisible = false;
    }
};
const handleChange = async (options = {}) => {
    setApiQueryWithToolboxOptions(apiQuery, options);
    await listSchedules();
};

watch(() => props.collector, () => {
    listSchedules();
}, { immediate: true });

</script>

<template>
    <div class="collector-schedules">
        <p-heading heading-type="sub"
                   use-total-count
                   :total-count="state.totalCount"
                   :title="t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_TITLE')"
        />
        <p-toolbox-table v-model:sort-by="tableState.sortBy"
                         v-model:sort-desc="tableState.sortDesc"
                         v-model:this-page="tableState.thisPage"
                         v-model:page-size="tableState.pageSize"
                         v-model:select-index="state.selectIndex"
                         :items="state.items"
                         :fields="tableState.fields"
                         sortable
                         hover
                         :all-page="tableState.allPage"
                         :setting-visible="false"
                         :loading="tableState.loading"
                         :selectable="true"
                         :multi-select="false"
                         use-cursor-loading
                         :row-height-fixed="false"
                         @change-page-size="listSchedules"
                         @change-page-number="listSchedules"
                         @click-refresh="listSchedules"
                         @change-sort="listSchedules"
                         @change="handleChange"
        >
            <template #toolbox-left>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          :disabled="manageDisabled"
                          @click="openEditModal(false)"
                >
                    {{ t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_ADD') }}
                </p-button>

                <p-select-dropdown :items="state.dropdown"
                                   class="ml-4"
                                   :disabled="manageDisabled"
                                   @select="onSelectDropdown"
                >
                    {{ t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_ACTION') }}
                </p-select-dropdown>
            </template>
            <template #th-schedule-format="{ field }">
                {{ field.label }} ({{ timezone }})
            </template>
            <template #col-schedule-format="{value}">
                <span v-if="value.hours.length > 0">
                    {{ getTimezoneHours(value.hours) }}
                </span>
                <span v-else>
                    <p-i class="inline-block mr-1"
                         name="ic_settings-filled"
                         animation="spin"
                         width="1rem"
                         height="1rem"
                    />
                    <span>{{ intervalFormatter(value.interval) }}</span>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, timezone) }}
            </template>
            <template #col-last_schedule_at-format="{value}">
                {{ value ? iso8601Formatter(value, timezone): '' }}
            </template>
        </p-toolbox-table>

        <edit-schedule-modal v-if="state.editVisible"
                             v-model:visible="state.editVisible"
                             :collector-id="collector.collector_id"
                             :schedule-id="state.items[state.selectIndex[0]] ? state.items[state.selectIndex[0]].schedule_id : null"
                             :edit-mode="state.isEditMode"
                             :supported-schedules="state.supportedSchedules"
                             @success="listSchedules"
        />

        <p-table-check-modal v-model:visible="state.deleteVisible"
                             :header-title="t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_DELETE_CHECK_MODAL_TITLE', 1)"
                             :sub-title="t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_DELETE_CHECK_MODAL_DESC', 1)"
                             theme-color="alert"
                             :fields="state.multiFields"
                             :items="state.multiItems"
                             modal-size="lg"
                             @confirm="onConfirmDelete"
        />
    </div>
</template>

<style lang="postcss" scoped>
.collector-schedules {
    .p-heading {
        margin-bottom: 0;
    }
    .p-toolbox-table {
        border-width: 0;
    }
}
</style>
