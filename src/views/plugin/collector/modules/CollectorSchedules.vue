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
                    {{ $t('BTN.ADD') }}
                </p-icon-text-button>

                <p-dropdown-menu-btn :menu="dropdown"
                                     class="ml-4"
                                     @click-update="openEditModal(true)"
                                     @click-delete="deleteVisible = true"
                >
                    {{ $t('BTN.ACTION') }}
                </p-dropdown-menu-btn>
            </template>
            <template #col-schedule-format="{value}">
                <span v-if="value.hours.length > 0">
                    <span v-for="(hour, idx) in value.hours" :key="idx">
                        {{ getUtcHour(hour) }}:00{{ value.hours.length - 1 === idx ? '' : ', ' }}
                    </span>
                </span>
                <span v-else>
                    <p-lottie class="inline-block" style="display: inline-block" name="lottie_interval" auto
                              :size="2"
                    />
                    <span>{{ intervalFormatter(value.interval) }}</span>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
            <template #col-last_schedule_at-format="{value}">
                {{ value ? timestampFormatter(value): '' }}
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
                             :header-title="$t('INVENTORY.DEL_SCHEDULE')"
                             sub-title="Are you sure you want to DELETE Selected Schedule(s)?"
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
import {
    reactive, toRefs, computed, watch, getCurrentInstance,
} from '@vue/composition-api';
import moment from 'moment';
import { showErrorMessage, timestampFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';

import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import EditScheduleModal from '@/views/plugin/collector/modules/EditScheduleModal.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import { fluentApi } from '@/lib/fluent-api';
import { store } from '@/store';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

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
    setup(props, { root, parent, emit }) {
        const vm: any = getCurrentInstance();
        const state = reactive({
            loading: true,
            items: [],
            selectIndex: [],
            editVisible: false,
            deleteVisible: false,
            fields: makeTrItems([
                ['schedule_id', 'COMMON.ID'],
                ['name', 'COMMON.NAME'],
                ['schedule', 'COMMON.SCHEDULE', { sortable: false, width: '25rem' }],
                ['created_at', 'COMMON.CREATED'],
            ], parent),
            dropdown: computed(() => makeTrItems([
                ['update', 'BTN.UPDATE', { disabled: state.selectIndex.length !== 1 }],
                ['delete', 'BTN.DELETE', { disabled: state.selectIndex.length === 0 }],
            ], parent, { type: 'item' })),
            sortBy: '',
            sortDesc: '',
            totalCount: 0,
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            multiItems: computed(() => state.selectIndex.map(idx => state.items[idx])),
            multiFields: makeTrItems([
                ['schedule_id', 'COMMON.ID'],
                ['name', 'COMMON.NAME'],
            ], parent),
            isEditMode: false,
        });

        const timezone = store.state.user.timezone || 'UTC';
        const getUtcHour = hour => moment.tz(moment.utc({ hour }), timezone).hour();
        const intervalFormatter = (interval) => {
            if (interval < 60) {
                return `${interval} sec`;
            } if (interval >= 60 && interval < 3600) {
                return `${Math.trunc(interval / 60)} hour`;
            }
            return `${Math.trunc(interval / 3600)} min`;
        };

        const openEditModal = (editMode: boolean) => {
            state.isEditMode = editMode;
            state.editVisible = true;
        };

        const listSchedules = debounce(async (): Promise<void> => {
            state.loading = true;
            state.selectIndex = [];
            state.totalCount = 0;
            try {
                const res = await fluentApi.inventory().collector().schedule().list()
                    .setCollectorId(props.collectorId)
                    .execute();
                state.items = res.data.results;
                state.totalCount = res.data.total_count;
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        }, 200);

        const onConfirmDelete = async () => {
            try {
                await fluentApi.inventory().collector().schedule().delete()
                    .setCollectorId(props.collectorId)
                    .setId(state.items[state.selectIndex[0]].schedule_id)
                    .execute();

                root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'Delete Schedule',
                    duration: 2000,
                    speed: 1000,
                });
                await listSchedules();
            } catch (e) {
                console.error(e);
                showErrorMessage('Fail to Delete Schedule(s)', e, root);
            } finally {
                state.deleteVisible = false;
            }
        };

        watch(() => props.collectorId, () => {
            listSchedules();
        }, { immediate: true });


        return {
            ...toRefs(state),
            getUtcHour,
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
