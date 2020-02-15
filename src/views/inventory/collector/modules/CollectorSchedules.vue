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
                         :selectable="false"
                         :page-size.sync="pageSize"
                         :setting-visible="false"
                         :loading="loading"
                         use-spinner-loading
                         use-cursor-loading
                         @changePageSize="listSchedules"
                         @changePageNumber="listSchedules"
                         @clickRefresh="listSchedules"
                         @changeSort="listSchedules"
        >
            <template slot="toolbox-left">
                <p-button style-type="primary-dark" @click="openEditModal(null)">
                    {{ tr('COMMON.BTN_ADD') }}
                </p-button>
            </template>
            <template #col-schedule-format="{value}">
                <span>
                    <span v-for="(hour, idx) in value.hours" :key="idx">
                        {{ hour }}{{ value.hours.length - 1 === idx ? '' : ', ' }}
                    </span>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ timestampFormatter(value) }}
            </template>
            <template #col-last_schedule_at-format="{value}">
                {{ value ? timestampFormatter(value): '' }}
            </template>
            <template #col-edit-format="{item}">
                <p-button style-type="dark" outline @click="openEditModal(item)">
                    {{ tr('COMMON.BTN_EDIT') }}
                </p-button>
            </template>
        </p-toolbox-table>

        <edit-schedule-modal v-if="proxyEditVisible"
                             :visible.sync="proxyEditVisible"
                             :loading="editLoading"
                             :schedule="schedule"
                             :collector-id="collector ? collector.collector_id : null"
        />
    </div>
</template>

<script>
import _ from 'lodash';
import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';
import { MenuItem, timestampFormatter } from '@/lib/util';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { makeTrItems } from '@/lib/view-helper';
import { makeProxy } from '@/lib/compostion-util';


import PButton from '@/components/atoms/buttons/Button.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import EditScheduleModal from '@/views/inventory/collector/modules/EditScheduleModal.vue';

export default {
    name: 'CollectorSchedules',
    components: {
        PToolboxTable,
        PButton,
        EditScheduleModal,
    },
    props: {
        items: Array,
        totalCount: Number,
        collector: Object,
        loading: Boolean,
        /**
         * sync prop
         */
        editVisible: Boolean,
        editLoading: Boolean,
    },
    setup(props, { root, parent, emit }) {
        const state = reactive({
            proxyEditVisible: makeProxy('editVisible', props, emit),
            fields: [
                ...makeTrItems([
                    ['scheduler_id', 'COMMON.ID'],
                    ['name', 'COMMON.NAME'],
                    ['schedule', 'COMMON.SCHEDULE', { sortable: false }],
                    ['last_schedule_at', 'COMMON.LAST_SCHEDULED'],
                    ['created_at', 'COMMON.CREATED'],
                ], parent),
                { name: 'edit', label: ' ', sortable: false }],
            sortBy: '',
            sortDesc: '',
            pageSize: 10,
            thisPage: 1,
            allPage: computed(() => Math.ceil(props.totalCount / state.pageSize) || 1),
            schedule: null,
        });

        const openEditModal = (item) => {
            state.schedule = item;
            state.proxyEditVisible = true;
        };

        const listSchedules = () => {
            // eslint-disable-next-line camelcase
            collectorEventBus.$emit('listSchedules', { collector_id: props.collector.collector_id });
        };

        watch(() => props.collector, () => {
            listSchedules();
        });


        return {
            ...toRefs(state),
            openEditModal,
            listSchedules,
            timestampFormatter,
        };
    },
};
</script>

<style lang="scss" scoped>
</style>
