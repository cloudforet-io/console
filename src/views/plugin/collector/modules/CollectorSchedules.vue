<template>
    <div>
        <p-toolbox-table :items="items"
                         :fields="fields"
                         sortable
                         hover
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :all-page="allPage"
                         :this-page.sync="thisPage"
                         :page-size.sync="pageSize"
                         :setting-visible="false"
                         :loading="loading"
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

                <p-dropdown-menu-btn :menu="dropdown"
                                     class="ml-4"
                                     @click-update="openEditModal(true)"
                                     @click-delete="deleteVisible = true"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_ACTION') }}
                </p-dropdown-menu-btn>
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
                {{ timestampFormatter(value, timezone) }}
            </template>
            <template #col-last_schedule_at-format="{value}">
                {{ value ? timestampFormatter(value, timezone): '' }}
            </template>
        </p-toolbox-table>

        <edit-schedule-modal v-if="editVisible"
                             :visible.sync="editVisible"
                             :collector-id="collectorId"
                             :schedule-id="items[selectIndex[0]] ? items[selectIndex[0]].schedule_id : null"
                             :edit-mode="isEditMode"
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
import { debounce } from 'lodash';
import dayjs from 'dayjs';

import {
    reactive, toRefs, computed, watch, getCurrentInstance,
} from '@vue/composition-api';

import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import EditScheduleModal from '@/views/plugin/collector/modules/EditScheduleModal.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { DataTableField } from '@/components/organisms/tables/data-table/type';
import { MenuItem } from '@/components/organisms/context-menu/type';

import { showErrorMessage, showSuccessMessage, timestampFormatter } from '@/lib/util';
import { ApiQueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import { store } from '@/store';

export default {
    name: 'CollectorSchedules',
    components: {
        PLottie,
        PTableCheckModal,
        PDropdownMenuBtn,
        PToolboxTable,
        EditScheduleModal,
        PIconTextButton,
    },
    props: {
        collectorId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm: any = getCurrentInstance();
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            loading: true,
            items: [],
            selectIndex: [],
            editVisible: false,
            deleteVisible: false,
            fields: [
                { name: 'schedule_id', label: 'ID' },
                { name: 'name', label: 'Name' },
                {
                    name: 'schedule', label: 'Schedule', sortable: false, width: '25rem',
                },
                { name: 'created_at', label: 'Created' },
            ] as DataTableField[],
            dropdown: computed<MenuItem[]>(() => [
                {
                    name: 'update', label: vm.$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_UPDATE'), type: 'item', disabled: state.selectIndex.length !== 1,
                },
                {
                    name: 'delete', label: vm.$t('PLUGIN.COLLECTOR.MAIN.SCHEDULE_DELETE'), type: 'item', disabled: state.selectIndex.length === 0,
                },
            ]),
            sortBy: '',
            sortDesc: '',
            totalCount: 0,
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            multiItems: computed(() => state.selectIndex.map(idx => state.items[idx])),
            multiFields: [
                { name: 'schedule_id', label: 'ID' },
                { name: 'name', label: 'Name' },
            ] as DataTableField[],
            isEditMode: false,
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

        const apiQuery = new ApiQueryHelper();
        const listSchedules = debounce(async (): Promise<void> => {
            state.loading = true;
            state.selectIndex = [];
            state.totalCount = 0;
            try {
                apiQuery.setSort(state.sortBy, state.sortDesc)
                    .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);

                const res = await SpaceConnector.client.inventory.collector.schedule.list({
                    collector_id: props.collectorId,
                    query: apiQuery.data,
                });
                state.items = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        }, 200);

        const onConfirmDelete = async () => {
            try {
                await SpaceConnector.client.inventory.collector.schedule.delete({
                    collector_id: props.collectorId,
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

        watch(() => props.collectorId, () => {
            listSchedules();
        }, { immediate: true });


        return {
            ...toRefs(state),
            getTimezoneHours,
            openEditModal,
            listSchedules,
            onConfirmDelete,
            intervalFormatter,
            timestampFormatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-toolbox-table {
    border-width: 0;
}
</style>
