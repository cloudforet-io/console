<template>
    <div>
        <p-toolbox-table :items="items"
                         :fields="fields"
                         sortable
                         hover
                         :border="false"
                         :shadow="false"
                         :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc"
                         :all-page="allPage"
                         :this-page.sync="thisPage"
                         :page-size.sync="pageSize"
                         :setting-visible="false"
                         :loading="loading"
                         :selectable="true"
                         :multi-select="false"
                         :select-index.sync="proxySelectIndex"
                         use-cursor-loading
                         @changePageSize="listSchedules"
                         @changePageNumber="listSchedules"
                         @clickRefresh="listSchedules"
                         @changeSort="listSchedules"
        >
            <template slot="toolbox-left">
                <p-button style-type="primary-dark" @click="openEditModal(null)">
                    {{ $t('BTN.ADD') }}
                </p-button>
                <p-dropdown-menu-btn :menu="dropdown"
                                     class="left-toolbox-item"
                                     @click-update="openEditModal(items[selectIndex[0]])"
                                     @click-delete="proxyDeleteVisible = true"
                >
                    {{ $t('BTN.ACTION') }}
                </p-dropdown-menu-btn>
            </template>
            <template #col-schedule-format="{value}">
                <span>
                    <span v-for="(hour, idx) in value.hours" :key="idx">
                        {{ getUtcHour(hour) }}:00{{ value.hours.length - 1 === idx ? '' : ', ' }}
                    </span>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
            <template #col-last_schedule_at-format="{value}">
                {{ value ? timestampFormatter(value): '' }}
            </template>
        </p-toolbox-table>

        <edit-schedule-modal v-if="proxyEditVisible"
                             :visible.sync="proxyEditVisible"
                             :loading="editLoading"
                             :schedule="schedule"
                             :collector-id="collector.collector_id"
        />

        <p-table-check-modal :visible.sync="proxyDeleteVisible"
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

<script>
import _ from 'lodash';
import {
    reactive, toRefs, computed, watch, getCurrentInstance,
} from '@vue/composition-api';
import moment from 'moment';
import { MenuItem, timestampFormatter } from '@/lib/util';
import collectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import { makeTrItems } from '@/lib/view-helper';
import { makeProxy } from '@/lib/compostion-util';


import PButton from '@/components/atoms/buttons/Button.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import EditScheduleModal from '@/views/plugin/collector/modules/EditScheduleModal.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import { fluentApi } from '@/lib/fluent-api';

export default {
    name: 'CollectorSchedules',
    components: {
        PTableCheckModal,
        PDropdownMenuBtn,
        PToolboxTable,
        PButton,
        EditScheduleModal,
    },
    props: {
        items: Array,
        totalCount: Number,
        collector: Object,
        // loading: Boolean,
        /**
         * sync prop
         */
        editVisible: Boolean,
        /**
        sync prop
         */
        selectIndex: Array,
        /**
         * sync prop
         */
        deleteVisible: Boolean,
        editLoading: Boolean,
    },
    setup(props, { root, parent, emit }) {
        const vm = getCurrentInstance();
        const state = reactive({
            loading: true,
            proxyEditVisible: makeProxy('editVisible', props, emit),
            proxyDeleteVisible: makeProxy('deleteVisible', props, emit),
            proxySelectIndex: makeProxy('selectIndex', props, emit),
            fields: makeTrItems([
                ['scheduler_id', 'COMMON.ID'],
                ['name', 'COMMON.NAME'],
                ['schedule', 'COMMON.SCHEDULE', { sortable: false }],
                ['last_schedule_at', 'COMMON.LAST_SCHEDULED'],
                ['created_at', 'COMMON.CREATED'],
            ], parent),
            dropdown: computed(() => makeTrItems([
                ['update', 'BTN.UPDATE', { disabled: props.selectIndex.length !== 1 }],
                ['delete', 'BTN.DELETE', { disabled: props.selectIndex.length === 0 }],
            ], parent, { type: 'item' })),
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(props.totalCount / state.pageSize) || 1),
            schedule: null,
            multiItems: computed(() => props.selectIndex.map(idx => props.items[idx])),
            multiFields: makeTrItems([
                ['scheduler_id', 'COMMON.ID'],
                ['name', 'COMMON.NAME'],
            ], parent),
        });

        const timezone = vm.$ls.user.state.timezone || 'UTC';
        const getUtcHour = hour => moment.tz(moment.utc({ hour }), timezone).hour();

        const openEditModal = (item) => {
            state.schedule = item;
            state.proxyEditVisible = true;
        };

        const listSchedules = async () => {
            // eslint-disable-next-line camelcase
            collectorEventBus.$emit('listSchedules', { collector_id: props.collector.collector_id });
            // await fluentApi.inventory().collector().s
        };

        const onConfirmDelete = () => {
            const params = {
                // eslint-disable-next-line camelcase
                collector_id: props.collector.collector_id,
                // eslint-disable-next-line camelcase
                scheduler_id: props.items[props.selectIndex[0]].scheduler_id, // state.multiItems,
            };
            collectorEventBus.$emit('deleteCollectorSchedule', params);
        };

        watch(() => props.collector, () => {
            listSchedules();
        });


        return {
            ...toRefs(state),
            getUtcHour,
            openEditModal,
            listSchedules,
            onConfirmDelete,
            timestampFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .left-toolbox-item {
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }
</style>
