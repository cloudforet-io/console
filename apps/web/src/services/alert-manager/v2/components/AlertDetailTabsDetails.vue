<script setup lang="ts">
import { computed, reactive } from 'vue';

import { map } from 'lodash';

import { PDefinitionTable, PHeading, PHeadingLayout } from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import type { AlertModel } from '@/schema/alert-manager/alert/model';

import { useAlertDetailPageStore } from '@/services/alert-manager/v2/stores/alert-detail-page-store';

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;

const storeState = reactive({
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
});
const state = reactive({
    data: computed<Record<string, any>>(() => storeState.alertInfo?.additional_info) || {},
    fields: computed<DefinitionField[]>(() => map(state.data, (d, k) => ({ name: k, label: k })).sort((a, b) => a.label.localeCompare(b.label))),
});

</script>

<template>
    <section>
        <p-heading-layout class="py-6 px-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.ALERTS.ADDITIONAL_INFO')"
                />
            </template>
        </p-heading-layout>
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :skeleton-rows="5"
                            block
        />
    </section>
</template>
