<template>
    <div>
        <p-info-panel :info-title="$t('PANEL.BASE_INFO')"
                      :defs="baseDefs" :item="item"
        >
            <template #def-name-format="data">
                <span class="name">
                    <img class="icon" :src="getIcon(data)">
                    {{ data.value }}
                </span>
            </template>
            <template #def-state-format="data">
                <p-status v-bind="collectorStateFormatter(data.value)" />
            </template>
            <template #def-plugin_info-format="{value}">
                <template v-if="value.options && value.options.supported_resource_type">
                    <div v-for="(d, i) in value.options.supported_resource_type" :key="i">
                        {{ d }}
                    </div>
                </template>
                <span v-else />
            </template>
            <template #def-default_collect_state-format="data">
                <span>ALL</span>
            </template>
            <template #def-last_collected_at-format="{value}">
                {{ value ? timestampFormatter(value) : '' }}
            </template>
            <template #def-created_at-format="{value}">
                {{ value ? timestampFormatter(value) : '' }}
            </template>
        </p-info-panel>

        <p-dict-panel :dict.sync="tagsApi.ts.syncState.dict"
                      :edit-mode.sync="tagsApi.ts.syncState.editMode"
                      v-on="tagsApi.ts.listeners"
        />

        <p-info-panel class="last-panel" :info-title="$t('PANEL.FILTER_FORMAT')">
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

<script lang="ts">
import {
    watch, computed, reactive, toRefs, defineComponent,
} from '@vue/composition-api';
import _ from 'lodash';
import { DictIGState } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import { timestampFormatter, collectorStateFormatter } from '@/lib/util';
import CollectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { makeTrItems } from '@/lib/view-helper';
import config from '@/lib/config';

import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { DictPanelAPI } from '@/components/organisms/panels/dict-panel/dict';
import { fluentApi } from '@/lib/fluent-api';

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
        getIcon: data => _.get(data.item, 'tags.icon', config.get('COLLECTOR_IMG')),
    });

    return {
        ...toRefs(state),
    };
};

const setTagStates = (props) => {
    const tagsApi = new DictPanelAPI(fluentApi.inventory().collector());

    watch(() => props.item, async (item) => {
        tagsApi.setId(item.collector_id);
        tagsApi.ts.toReadMode();
        await tagsApi.getData();
    });

    return {
        tagsApi,
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
        filterItems: computed(() => _.get(props.item, 'plugin_info.options.filter_format', [])),
    });

    return {
        timestampFormatter,
        collectorStateFormatter,
        ...toRefs(state),
    };
};

export default defineComponent({
    name: 'CollectorDetail',
    components: {
        PInfoPanel, PDictPanel, PDataTable, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        tagsFetchApi: {
            type: [Object, Function],
            required: true,
        },
    },
    setup(props, { parent }) {
        const baseInfoStates = setBaseInfoStates(props, parent);
        const tagStates = setTagStates(props);
        const filterFormatStates = setFilterFormatStates(props, parent);
        return {
            ...baseInfoStates,
            ...tagStates,
            ...filterFormatStates,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .name {
        .icon {
            display: inline-block;
            width: 1.5rem;
            height: 1.5rem;
            margin-right: .5rem;
        }
    }
</style>
