<template>
    <p-pane-layout>
        <p-heading :title="$t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_OPTIONS')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                >
                    {{ $t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>
        <p-definition-table :fields="state.fields"
                            :loading="props.loading"
                            :data="props.collectorOptions"
                            style-type="white"
        />
    </p-pane-layout>
</template>

<script lang="ts" setup>
import { defineProps, computed, reactive } from 'vue';

import {
    PHeading, PButton, PPaneLayout, PDefinitionTable,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/types/data-display/tables/definition-table/type';

import type { CollectorPluginModel } from '@/services/asset-inventory/collector/model';

const props = defineProps<{
    loading: boolean;
    collectorOptions: CollectorPluginModel['options']|null;
}>();


const state = reactive({
    fields: computed<DefinitionField[]>(() => {
        if (!props.collectorOptions) return [];
        return Object.keys(props.collectorOptions).map((key) => ({
            name: key,
            label: key,
        }));
    }),
});

</script>

<style lang="postcss" scoped>
.p-definition-table {
    border-color: transparent;
}
</style>
