<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-name-format="data">
                <span class="name">
                    <img class="icon" :src="data.item.tags.icon || defaultImg">
                    {{ data.value }}
                </span>
            </template>
            <template #def-state-format="data">
                <p-status v-bind="collectorStateFormatter(data.value)" />
            </template>
            <template #def-plugin_info-format="data">
                <template v-if="data.value.options && data.value.options.supported_resource_type">
                    <div v-for="(d, i) in data.value.options.supported_resource_type" :key="i">
                        {{ d }}
                    </div>
                </template>
                <span v-else />
            </template>
            <template #def-default_collect_state-format="data">
                <span>ALL</span>
            </template>
            <template #def-last_collected_at-format="data">
                {{ data.value ? timestampFormatter(data.value) : '' }}
            </template>
            <template #def-created_at-format="data">
                {{ timestampFormatter(data.value) }}
            </template>
        </p-info-panel>

        <p-dict-panel ref="dictPanel" :dict.sync="tags" @confirm="confirm" />

        <p-info-panel class="last-panel" info-title="Filter Format">
            <p-data-table
                :fields="fields"
                :sortable="false"
                :selectable="false"
                :items="filterItems"
                :col-copy="true"
            />
        </p-info-panel>
    </div>
</template>

<script>
import {
    watch, computed, reactive, toRefs,
} from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import { timestampFormatter, collectorStateFormatter } from '@/lib/util';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/view-helper';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import config from '@/lib/config';

const setBaseInfoStates = (props, parent) => {
    const state = reactive({
        baseDefs: makeTrItems([
            ['collector_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['priority', 'COMMON.PRIORITY'],
            ['plugin_info', 'COMMON.RESOURCE'],
            ['default_collect_state', 'COMMON.DEF_COL_STATE'],
            ['last_collected_at', 'COMMON.LAST_COL'],
            ['created_at', 'COMMON.CREATED'],
        ], parent, { copyFlag: true }),
        defaultImg: config.get('COLLECTOR_IMG'),
    });

    return {
        ...toRefs(state),
    };
};

const setTagStates = (props) => {
    const state = reactive({
        tags: props.item.tags,
        confirm(...event) {
            collectorEventBus.$emit('confirmTags', props.item.collector_id, ...event);
        },
        dictPanel: null,
    });

    watch(() => props.item, (value) => {
        state.tags = value.tags;
    });

    const resetTag = () => {
        state.dictPanel.reset();
    };
    mountBusEvent(collectorEventBus, 'resetTags', resetTag);

    return {
        ...toRefs(state),
    };
};

const setFilterFormatStates = (props, parent) => {
    const state = reactive({
        fields: makeTrItems([
            ['name', 'COMMON.NAME'],
            ['key', 'COMMON.KEY'],
            ['type', 'COMMON.TYPE'],
            ['resource_type', 'COMMON.RESOURCE'],
        ],
        parent),
        filterItems: computed(() => props.item.plugin_info.options.filter_format || []),
    });

    return {
        timestampFormatter,
        collectorStateFormatter,
        ...toRefs(state),
    };
};

export default {
    name: 'PServerDetail',
    components: {
        PInfoPanel, PDictPanel, PDataTable, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
    },
    setup(props, { parent }) {
        const baseInfoStates = setBaseInfoStates(props, parent);
        const tagStates = setTagStates(props, parent);
        const filterFormatStates = setFilterFormatStates(props, parent);
        return {
            ...baseInfoStates,
            ...tagStates,
            ...filterFormatStates,
        };
    },
};
</script>

<style lang="scss" scoped>
    .name {
        .icon {
            width: 1.5rem;
            height: 1.5rem;
            margin-right: .5rem;
        }
    }
</style>
