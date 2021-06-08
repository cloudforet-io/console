<template>
    <p-pane-layout class="alert-detail-info">
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="10"
                            :stripe="false"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout, PDefinitionTable } from '@spaceone/design-system';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'AlertDetailInfo',
    components: {
        PPaneLayout,
        PDefinitionTable,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            fields: [
                { name: 'triggered_by', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.TRIGGERED_BY') },
                { name: 'escalation_policy', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.ESCALATION_POLICY') },
                { name: 'project_id', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.PROJECT') },
                { name: 'severity', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.SEVERITY') },
                { name: 'created_at', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.CREATED') },
                { name: 'acknowledged_at', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.ACKNOWLEDGED') },
                { name: 'resolved_at', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.RESOLVED') },
                { name: 'alert_id', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.ALERT_ID') },
                { name: 'description', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.DESC') },
                { name: 'status_message', label: vm.$t('MONITORING.ALERT.DETAIL.INFO.STATUS_DETAILS') },
            ],
            data: {},
            loading: true,
        });

        const getAlertData = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.monitoring.alert.get({
                    alert_id: props.id,
                });
                state.data = res;
            } catch (e) {
                console.error(e);
            }
        };

        (async () => {
            await getAlertData();
        })();

        return {
            ...toRefs(state),
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-info {

}
</style>
