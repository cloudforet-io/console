<template>
    <div>
        <p-toolbox-table :items="items"
                         :fields="tableState.fields"
                         sortable
                         hover
                         :sort-by.sync="tableState.sortBy"
                         :sort-desc.sync="tableState.sortDesc"
                         :all-page="tableState.allPage"
                         :this-page.sync="tableState.thisPage"
                         :page-size.sync="tableState.pageSize"
                         :setting-visible="false"
                         :loading="tableState.loading"
                         :selectable="true"
                         :multi-select="false"
                         :select-index.sync="selectIndex"
                         use-cursor-loading
                         :row-height-fixed="false"
                         @changePageSize="listSchedules"
                         @changePageNumber="listSchedules"
                         @clickRefresh="listSchedules"
                         @changeSort="listSchedules"
        >
            <template slot="toolbox-left">
                <p-icon-text-button style-type="primary-dark"
                                    name="ic_plus_bold"
                                    @click="openEditModal(false)"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_ADD') }}
                </p-icon-text-button>

                <p-select-dropdown :items="dropdown"
                                   class="ml-4"
                                   @select="onSelectDropdown"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-schedule-format="{value}">
                <span v-if="value.hours.length > 0">
                    {{ getTimezoneHours(value.hours) }}
                </span>
                <span v-else>
                    <p-lottie class="inline-block mr-1" style="display: inline-block;" name="lottie_interval"
                              auto :size="1"
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

        <edit-schedule-modal v-if="editVisible"
                             :visible.sync="editVisible"
                             :collector-id="collector.collector_id"
                             :schedule-id="items[selectIndex[0]] ? items[selectIndex[0]].schedule_id : null"
                             :edit-mode="isEditMode"
                             :supported-schedules="supportedSchedules"
                             @success="listSchedules"
        />

        <p-table-check-modal :visible.sync="deleteVisible"
                             :header-title="$tc('PLUGIN.COLLECTOR.MAIN.SCHEDULE_DELETE_CHECK_MODAL_TITLE', 1)"
                             :sub-title="$tc('PLUGIN.COLLECTOR.MAIN.SCHEDULE_DELETE_CHECK_MODAL_DESC', 1)"
                             theme-color="alert"
                             :fields="multiFields"
                             size="lg"
                             centered
                             :selectable="false"
                             :items="multiItems"
                             @confirm="onConfirmDelete"
        />
    </div>
</template>

<script lang="ts">
import { debounce, get } from 'lodash';
import dayjs from 'dayjs';

import {
    reactive, toRefs, computed, watch, getCurrentInstance,
} from '@vue/composition-api';

import {
    PIconTextButton, PToolboxTable, PSelectDropdown, PTableCheckModal, PLottie,
} from '@spaceone/design-system';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import EditScheduleModal from '@/views/plugin/collector/modules/EditScheduleModal.vue';
import {
    iso8601Formatter, showErrorMessage, showSuccessMessage,
} from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { getPageStart } from '@/lib/component-utils/pagination';
import { store } from '@/store';

export default {
    name: 'CollectorSchedules',
    components: {
        PLottie,
        PTableCheckModal,
        PSelectDropdown,
        PToolboxTable,
        PIconTextButton,
        EditScheduleModal,
    },
    props: {
        collector: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm: any = getCurrentInstance();
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            items: [],
            selectIndex: [],
            editVisible: false,
            deleteVisible: false,
            supportedSchedules: computed(() => get(props.collector, 'plugin_info.metadata.supported_schedules')),
            dropdown: computed<MenuItem[]>(() => [
                {
                    name: 'update', label: vm.$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_UPDATE'), disabled: state.selectIndex.length !== 1,
                },
                {
                    name: 'delete', label: vm.$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_DELETE'), disabled: state.selectIndex.length === 0,
                },
            ]),
            multiItems: computed(() => state.selectIndex.map(idx => state.items[idx])),
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
            totalCount: 0,
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(tableState.totalCount / tableState.pageSize) || 1),
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
            tableState.totalCount = 0;
            try {
                apiQuery.setSort(tableState.sortBy, tableState.sortDesc)
                    .setPage(getPageStart(tableState.thisPage, tableState.pageSize), tableState.pageSize);

                const res = await SpaceConnector.client.inventory.collector.schedule.list({
                    collector_id: props.collector.collector_id,
                    query: apiQuery.data,
                });
                state.items = res.results;
                tableState.totalCount = res.total_count;
            } catch (e) {
                state.items = [];
                console.error(e);
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
                showSuccessMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_S_DELETE_SCHEDULE_TITLE', 1), '', vm.$root);
                await listSchedules();
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_E_DELETE_SCHEDULE_TITLE', 1), e, vm.$root);
            } finally {
                state.deleteVisible = false;
            }
        };

        watch(() => props.collector, () => {
            listSchedules();
        }, { immediate: true });


        return {
            ...toRefs(state),
            tableState,
            getTimezoneHours,
            openEditModal,
            onSelectDropdown,
            listSchedules,
            onConfirmDelete,
            intervalFormatter,
            iso8601Formatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-toolbox-table {
    border-width: 0;
}
</style>
