<script lang="ts" setup>

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { PToolbox } from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

interface Props {
    totalCount: number;
    filters: ConsoleFilter[];
    handlers: { keyItemSets: KeyItemSet[]; valueHandlerMap: ValueHandlerMap };
}

const props = withDefaults(defineProps<Props>(), {
    totalCount: 0,
    filters: () => [],
    handlers: () => ({}) as Props['handlers'],
});
const emit = defineEmits<{(e: 'update-toolbox', value: ToolboxOptions): void}>();
const { t } = useI18n();
const store = useStore();

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    keyItemSets: props.handlers.keyItemSets,
    valueHandlerMap: props.handlers.valueHandlerMap,
    cloudServiceFilters: computed(() => props.filters.filter((f: ConsoleFilter) => f.k && ![
        'labels',
        'service_code',
    ].includes(f.k))),
    sortByOptions: computed(() => [
        { type: 'item', label: t('PLUGIN.COLLECTOR.PLUGINS.NAME'), name: 'name' },
        { type: 'item', label: t('PLUGIN.COLLECTOR.PLUGINS.RECENT'), name: 'created_at' },
    ]),
});

/* event */
const handleChange = async (options: ToolboxOptions = {}) => {
    emit('update-toolbox', options);
};

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/provider/load');
})();

</script>

<template>
    <div>
        <slot name="filters" />
        <p-toolbox :total-count="totalCount"
                   :sortable="true"
                   :page-size-changeable="false"
                   sort-by="name"
                   :sort-by-options="state.sortByOptions"
                   @change="handleChange"
                   @refresh="handleChange()"
        />
    </div>
</template>
