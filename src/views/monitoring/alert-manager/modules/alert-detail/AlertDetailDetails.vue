<template>
    <section>
        <p-panel-top>{{ $t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS') }}</p-panel-top>
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="7"
                            block
        >
            <template #data-created_at>
                {{ iso8601Formatter(data.created_at, timezone) }}
            </template>
            <template #data-acknowledged_at>
                <span v-if="data.acknowledged_at"> {{ iso8601Formatter(data.acknowledged_at, timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-resolved_at>
                <span v-if="data.resolved_at"> {{ iso8601Formatter(data.resolved_at, timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
        </p-definition-table>
        <p-panel-top>{{ $t('MONITORING.ALERT.DETAIL.DETAILS.ADDITIONAL_INFO') }}</p-panel-top>
        <p-definition-table :fields="additionalState.fields" :data="additionalState.data"
                            :skeleton-rows="7"
                            block
        />
    </section>
</template>

<script lang="ts">
import {
    PDefinitionTable, PPanelTop,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { i18n } from '@/translations';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { AlertDataModel } from '@/views/monitoring/alert-manager/type';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { map } from 'lodash';
import { store } from '@/store';

interface Props {
    id: string;
    alertData: AlertDataModel;
}

export default {
    name: 'AlertDetailDetails',
    components: {
        PDefinitionTable,
        PPanelTop,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props) {
        const state = reactive({
            fields: computed(() => [
                { name: 'alert_id', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ALERT_ID') },
                { name: 'resource.name', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_NAME') },
                { name: 'resource.resource_id', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_ID') },
                { name: 'resource.resource_type', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.RESOURCE_TYPE') },
                { name: 'created_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.CREATED'), disableCopy: true },
                { name: 'acknowledged_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED'), disableCopy: true },
                { name: 'resolved_at', label: i18n.t('MONITORING.ALERT.DETAIL.INFO.RESOLVED'), disableCopy: true },
            ]),
            data: props.alertData || {},
            escalationPolicyName: '',
            loading: true,
            timezone: computed(() => store.state.user.timezone),
        });

        const checkEmptyValue = (data: object) => Object.values(data).every(el => el.length === 0);
        const additionalState = reactive({
            fields: computed(() => map(additionalState.data, (d, k) => ({ name: k, label: k }))),
            // eslint-disable-next-line camelcase
            data: props.alertData?.additional_info || {},
            loading: true,
            isEmptyValue: computed(() => checkEmptyValue(additionalState.data)),
        });

        return {
            ...toRefs(state),
            additionalState,
            iso8601Formatter,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
