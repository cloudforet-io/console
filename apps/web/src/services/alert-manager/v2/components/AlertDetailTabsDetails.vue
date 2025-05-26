<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { map } from 'lodash';

import { PDefinitionTable, PHeading, PHeadingLayout } from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';

import { useAlertGetQuery } from '@/services/alert-manager/v2/composables/use-alert-get-query';

const route = useRoute();
const { alertData } = useAlertGetQuery(route.params.alertId as string);

const state = reactive({
    data: computed<Record<string, any>>(() => alertData.value?.additional_info || {}),
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
