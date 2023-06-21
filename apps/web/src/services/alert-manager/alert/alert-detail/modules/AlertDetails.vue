<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import {
    PDefinitionTable, PHeading,
} from '@spaceone/design-system';
import { map } from 'lodash';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { useAlertPageStore } from '@/services/alert-manager/store/alert-page-store';


interface Props {
    id: string;
}

defineProps<Props>();
const store = useStore();
const { t } = useI18n();

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.$state;

const state = reactive({
    fields: computed(() => [
        { name: 'alert_id', label: t('MONITORING.ALERT.DETAIL.INFO.ALERT_ID') },
        { name: 'resource.name', label: t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
        { name: 'resource.resource_id', label: t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_ID') },
        { name: 'resource.resource_type', label: t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_TYPE') },
        { name: 'created_at', label: t('MONITORING.ALERT.DETAIL.INFO.CREATED'), disableCopy: true },
        { name: 'acknowledged_at', label: t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED'), disableCopy: true },
        { name: 'resolved_at', label: t('MONITORING.ALERT.DETAIL.INFO.RESOLVED'), disableCopy: true },
    ]),
    data: computed(() => alertPageState.alertData ?? {}),
    escalationPolicyName: '',
    loading: true,
    timezone: computed(() => store.state.user.timezone),
});

const checkEmptyValue = (data: Record<string, any>) => Object.values(data).every((el) => el.length === 0);
const additionalState = reactive({
    fields: computed(() => map(additionalState.data, (d, k) => ({ name: k, label: k }))),
    // eslint-disable-next-line camelcase
    data: computed(() => alertPageState.alertData?.additional_info) || {},
    loading: true,
    isEmptyValue: computed(() => checkEmptyValue(additionalState.data)),
});

</script>

<template>
    <section>
        <p-heading heading-type="sub"
                   :title="t('PAGE_SCHEMA.BASE_INFO')"
        />
        <p-definition-table :fields="state.fields"
                            :data="state.data"
                            :skeleton-rows="7"
                            block
        >
            <template #data-created_at>
                {{ iso8601Formatter(state.data.created_at, state.timezone) }}
            </template>
            <template #data-acknowledged_at>
                <span v-if="state.data.acknowledged_at"> {{ iso8601Formatter(state.data.acknowledged_at, state.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-resolved_at>
                <span v-if="state.data.resolved_at"> {{ iso8601Formatter(state.data.resolved_at, state.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
        </p-definition-table>
        <p-heading heading-type="sub"
                   :title="t('MONITORING.ALERT.DETAIL.DETAILS.ADDITIONAL_INFO')"
        />
        <p-definition-table :fields="additionalState.fields"
                            :data="additionalState.data"
                            :skeleton-rows="7"
                            block
        />
    </section>
</template>
