<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PDefinitionTable, PLazyImg, PStatus, PTextList,
} from '@spaceone/design-system';
import {
    computed, reactive, useAttrs, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';


interface Props {
    collectorId: string;
}

const props = defineProps<Props>();

const store = useStore();
const { t } = useI18n();
const attrs = useAttrs();

const state = reactive({
    name: computed(() => t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_TITLE')),
    timezone: computed(() => store.state.user.timezone) as unknown as string,
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    loading: true,
    fields: computed(() => [
        { label: t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_NAME'), name: 'name' },
        { label: t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_STATE'), name: 'state' },
        { label: t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_PLUGIN'), name: 'plugin_name' },
        { label: t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_VERSION'), name: 'plugin_info.version' },
        { label: t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_PROVIDER'), name: 'provider' },
        { label: t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_LAST_COLLECTED'), name: 'last_collected_at' },
        { label: t('PLUGIN.COLLECTOR.MAIN.DETAILS_BASE_LABEL_CREATED'), name: 'created_at' },
    ]),
    data: {},
});

/* api */
const getCollectorDetailData = async () => {
    const res = await SpaceConnector.client.inventory.collector.get({
        collector_id: props.collectorId,
        only: ['name', 'provider', 'state', 'plugin_info.version',
            'last_collected_at', 'created_at', 'tags', 'plugin_info.plugin_id'],
    });

    if (res) {
        state.data = {
            plugin_name: state.plugins[res.plugin_info.plugin_id]?.label,
            plugin_icon: state.plugins[res.plugin_info.plugin_id]?.icon,
            ...res,
        };
    }
    state.loading = false;
};

const listeners = { ...attrs };

watch(() => props.collectorId, () => {
    getCollectorDetailData();
}, { immediate: true });

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/plugin/load');
})();

</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :title="name"
        />
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :loading="state.loading"
                            :skeleton-rows="7"
                            v-on="listeners"
        >
            <template #data-state="{data}">
                <p-status :text="data"
                          :theme="data === 'DISABLED' ? 'red' : 'green'"
                />
            </template>
            <template #data-plugin_name="{data: pluginName}">
                <p-lazy-img :src="state.data.plugin_icon"
                            :loading="state.loading"
                            width="1rem"
                            height="1rem"
                />
                <span class="ml-2 leading-none">{{ pluginName }}</span>
            </template>
            <template #data-plugin_info.metadata.metadata.supported_resource_type="{data}">
                <p-text-list :items="data || []"
                             delimiter="<br>"
                             class="text-list"
                />
            </template>
            <template #data-created_at="{ data }">
                {{ data ? iso8601Formatter(data, state.timezone) : '' }}
            </template>
            <template #data-last_collected_at="{ data }">
                {{ data ? iso8601Formatter(data, state.timezone) : '' }}
            </template>
        </p-definition-table>
    </div>
</template>

<style lang="postcss">
.text-list {
    line-height: inherit;
}
</style>
