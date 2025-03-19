<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PDefinitionTable,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import type { EscalationPolicyRulesType } from '@/schema/alert-manager/escalation-policy/type';
import type { ServiceUpdateParameters } from '@/schema/alert-manager/service/api-verbs/update';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import {
    ESCALATION_POLICY_MANAGEMENT_TABLE_FIELDS,
} from '@/services/alert-manager/v2/constants/escalation-policy-table-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface Props {
    visible: boolean;
    selectedItem: EscalationPolicyModel;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    selectedItem: undefined,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'close'): void;
}>();

const storeState = reactive({
    timezone: computed<string>(() => serviceDetailPageGetters.timezone),
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
});
const getConnectChannelCount = (rules: EscalationPolicyRulesType[]): number => {
    const allChannels = rules.flatMap((item) => item.channels);
    const uniqueChannels = new Set(allChannels);
    return uniqueChannels.size;
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.service.update<ServiceUpdateParameters, ServiceModel>({
            escalation_policy_id: props.selectedItem.escalation_policy_id,
            service_id: storeState.serviceId,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_UPDATE_SERVICE'), '');
        await serviceDetailPageStore.fetchServiceDetailData(storeState.serviceId);
        state.proxyVisible = false;
        emit('close');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <p-button-modal class="service-detail-tabs-settings-escalation-policy-state-modal"
                    :visible.sync="state.proxyVisible"
                    :header-title="$t('ALERT_MANAGER.ESCALATION_POLICY.MODAL_STATE_TITLE')"
                    :loading="state.loading"
                    size="md"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-definition-table :fields="ESCALATION_POLICY_MANAGEMENT_TABLE_FIELDS"
                                :data="props.selectedItem"
                                :skeleton-rows="4"
                                block
                                disable-copy
                                class="table mb-18"
                                style-type="white"
            >
                <template #data-repeat="{data}">
                    {{ data?.count || 0 }}
                </template>
                <template #data-rules="{data}">
                    {{ getConnectChannelCount(data) }}
                </template>
                <template #data-created_at="{data}">
                    {{ iso8601Formatter(data, storeState.timezone) }}
                </template>
            </p-definition-table>
        </template>
    </p-button-modal>
</template>


<style lang="postcss" scoped>
.service-detail-tabs-settings-escalation-policy-state-modal {
    .table {
        @apply border border-gray-200 rounded-lg;
        overflow: hidden;
        min-height: unset;
    }
    :deep(.table) {
        tr:last-child {
            border-bottom-width: 0;
        }
    }
}
</style>
