<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PDefinitionTable, PHeading,
} from '@spaceone/design-system';
import { map } from 'lodash';

import { i18n } from '@/translations';

import { useAlertPageStore } from '@/services/alert-manager/stores/alert-page-store';

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const state = reactive({
    fields: computed(() => [
        { name: 'alert_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ALERT_ID') },
        { name: 'resource.name', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
        { name: 'resource.resource_id', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_ID') },
        { name: 'resource.resource_type', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_TYPE') },
    ]),
    data: computed(() => alertPageState.alertData ?? {}),
});

const additionalState = reactive({
    fields: computed(() => map(additionalState.data, (d, k) => ({ name: k, label: k })).sort((a, b) => a.label.localeCompare(b.label))),
    data: computed(() => alertPageState.alertData?.additional_info) || {},
});

</script>

<template>
    <section>
        <p-heading heading-type="sub"
                   :title="$t('PAGE_SCHEMA.BASE_INFO')"
        />
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :skeleton-rows="7"
                            block
        >
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
        </p-definition-table>
        <p-heading heading-type="sub"
                   :title="$t('MONITORING.ALERT.DETAIL.DETAILS.ADDITIONAL_INFO')"
        />
        <p-definition-table :fields="additionalState.fields"
                            :data="additionalState.data"
                            :skeleton-rows="7"
                            block
        />
    </section>
</template>
