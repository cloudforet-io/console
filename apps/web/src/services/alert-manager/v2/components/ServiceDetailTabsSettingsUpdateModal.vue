<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PButtonModal, PSelectCard, PI,
} from '@cloudforet/mirinae';

import { NOTIFICATION_URGENCY, RECOVERY_MODE } from '@/api-clients/alert-manager/service/schema/constants';
import type { NotificationUrgencyType, RecoveryModeType, ServiceOptionsType } from '@/api-clients/alert-manager/service/schema/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

import { red } from '@/styles/colors';

import { useServiceGetQuery } from '@/services/alert-manager/v2/composables/use-service-get-query';
import { useServiceUpdateMutation } from '@/services/alert-manager/v2/composables/use-service-update-mutation';
import { SERVICE_SETTING_CARD } from '@/services/alert-manager/v2/constants/common-constant';
import type { ServiceDetailSettingCardType } from '@/services/alert-manager/v2/types/alert-manager-type';

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

const route = useRoute();
const serviceId = computed<string>(() => route.params.serviceId as string);

const { serviceData } = useServiceGetQuery(serviceId.value);

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const state = reactive({
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

const { mutate: updateService, isPending: updateServiceLoading } = useServiceUpdateMutation({
    onSuccess: async () => {
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_UPDATE_SERVICE'), '');
        state.proxyVisible = false;
    },
});
const handleConfirm = async () => {
    const options = serviceData.value?.options || {} as ServiceOptionsType;
    if (props.type === SERVICE_SETTING_CARD.AUTO_RECOVERY) {
        options.recovery_mode = state.selectedOption as RecoveryModeType;
    } else if (props.type === SERVICE_SETTING_CARD.NOTIFICATION_POLICY) {
        options.notification_urgency = state.selectedOption as NotificationUrgencyType;
    }

    updateService({
        service_id: serviceId.value,
        options,
    });
};

watch(() => props.type, (type) => {
    state.selectedOption = type === SERVICE_SETTING_CARD.NOTIFICATION_POLICY
        ? serviceData.value?.options?.notification_urgency || NOTIFICATION_URGENCY.ALL
        : serviceData.value?.options?.recovery_mode || RECOVERY_MODE.MANUAL;
}, { immediate: true });
</script>

<template>
    <p-button-modal class="service-detail-tabs-setting-modal"
                    :header-title="state.modalInfo.title"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="state.proxyVisible"
                    :loading="updateServiceLoading"
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
