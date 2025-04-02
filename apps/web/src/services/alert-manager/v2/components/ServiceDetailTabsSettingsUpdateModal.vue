<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PSelectCard, PI,
} from '@cloudforet/mirinae';

import type { ServiceUpdateParameters } from '@/schema/alert-manager/service/api-verbs/update';
import { NOTIFICATION_URGENCY, RECOVERY_MODE } from '@/schema/alert-manager/service/constants';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { NotificationUrgencyType, RecoveryModeType } from '@/schema/alert-manager/service/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { red } from '@/styles/colors';

import { SERVICE_SETTING_CARD } from '@/services/alert-manager/v2/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { ServiceDetailSettingCardType, Service } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    visible: boolean;
    type?: ServiceDetailSettingCardType
}
type SelectOptions = {
    name: string;
    label: TranslateResult;
    icon?: string;
    iconColor?: string;
};
type ModalInfoTYpe = {
    title: TranslateResult,
    desc: TranslateResult,
    options: SelectOptions[],
};

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: undefined,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    modalInfo: computed<ModalInfoTYpe>(() => {
        switch (props.type) {
        case SERVICE_SETTING_CARD.NOTIFICATION_POLICY:
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.SET_NOTIFICATION_POLICY'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.SET_NOTIFICATION_POLICY_DESC'),
                options: [
                    { name: NOTIFICATION_URGENCY.ALL, label: i18n.t('ALERT_MANAGER.NOTIFICATIONS.ALL_NOTIFICATIONS') },
                    {
                        name: NOTIFICATION_URGENCY.HIGH_ONLY,
                        label: i18n.t('ALERT_MANAGER.NOTIFICATIONS.HIGH_NOTIFICATIONS_ONLY'),
                        icon: 'ic_error-filled',
                        iconColor: red[400],
                    },
                ],
            };
        case SERVICE_SETTING_CARD.AUTO_RECOVERY:
            return {
                title: i18n.t('ALERT_MANAGER.SERVICE.SET_AUTO_RECOVERY'),
                desc: i18n.t('ALERT_MANAGER.SERVICE.SET_AUTO_RECOVERY_DESC'),
                options: [
                    { name: RECOVERY_MODE.MANUAL, label: i18n.t('ALERT_MANAGER.ALERTS.SET_AUTO_RECOVERY_NO') },
                    { name: RECOVERY_MODE.AUTO, label: i18n.t('ALERT_MANAGER.ALERTS.SET_AUTO_RECOVERY_YES') },
                ],
            };
        default:
            return { title: '', desc: '', options: [] };
        }
    }),
    selectedOption: undefined as string | undefined,
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        const options = storeState.serviceInfo.options;
        if (props.type === SERVICE_SETTING_CARD.AUTO_RECOVERY) {
            options.recovery_mode = state.selectedOption as RecoveryModeType;
        } else if (props.type === SERVICE_SETTING_CARD.NOTIFICATION_POLICY) {
            options.notification_urgency = state.selectedOption as NotificationUrgencyType;
        }

        await SpaceConnector.clientV2.alertManager.service.update<ServiceUpdateParameters, ServiceModel>({
            service_id: storeState.serviceInfo.service_id,
            options,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_UPDATE_SERVICE'), '');
        await serviceDetailPageStore.fetchServiceDetailData(storeState.serviceInfo.service_id);
        state.proxyVisible = false;
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};

watch(() => props.type, (type) => {
    state.selectedOption = type === SERVICE_SETTING_CARD.NOTIFICATION_POLICY
        ? storeState.serviceInfo.options.notification_urgency
        : storeState.serviceInfo.options.recovery_mode;
}, { immediate: true });
</script>

<template>
    <p-button-modal class="service-detail-tabs-setting-modal"
                    :header-title="state.modalInfo.title"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="state.proxyVisible"
                    :loading="state.loading"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="form-contents">
                <p class="text-paragraph-lg mb-4">
                    {{ state.modalInfo.desc }}
                </p>
                <div class="flex flex-col gap-2">
                    <p-select-card v-for="(option, index) in state.modalInfo.options"
                                   :key="option.name"
                                   v-model="state.selectedOption"
                                   class="card"
                                   :tab-index="index"
                                   :value="option.name"
                                   :label="option.label"
                                   block
                    >
                        <div v-if="option.icon"
                             class="flex items-center gap-1"
                        >
                            <p-i class="icon"
                                 :name="option.icon"
                                 :color="option.iconColor"
                                 height="1rem"
                                 width="1rem"
                            />
                            <span class="text-label-md font-bold">{{ option.label }}</span>
                        </div>
                    </p-select-card>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.service-detail-tabs-setting-modal {
    .card {
        padding-top: 1rem;
        padding-bottom: 1rem;
        border-radius: 0.375rem;
    }
}
</style>
