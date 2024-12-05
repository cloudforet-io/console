<script setup lang="ts">
import { computed, reactive } from 'vue';

import { map } from 'lodash';

import { PDefinitionTable, PHeading, PHeadingLayout } from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/src/data-display/tables/definition-table/type';

import { useAlertPageStore } from '@/services/alert-manager-v2/stores/alert-page-store';

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;


const additionalState = reactive({
    fields: computed<DefinitionField[]>(() => map(additionalState.data, (d, k) => ({ name: k, label: k })).sort((a, b) => a.label.localeCompare(b.label))),
    // TODO: add type
    data: computed(() => alertPageState.alertData?.additional_info) || {},
});

</script>

<template>
    <section>
        <p-heading-layout class="py-6 px-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.ALERTS.BASE_INFO_TITLE')"
                />
            </template>
        </p-heading-layout>
        <p-definition-table :fields="additionalState.fields"
                            :data="additionalState.data"
                            :skeleton-rows="7"
                            block
        />
    </section>
</template>
