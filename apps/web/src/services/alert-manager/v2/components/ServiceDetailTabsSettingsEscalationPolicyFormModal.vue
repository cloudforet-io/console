<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PTextInput, PRadio, PFieldGroup, PRadioGroup, PTextButton,
} from '@cloudforet/mirinae';

import { ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { EscalationPolicyCreateParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/create';
import type { EscalationPolicyUpdateParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/update';
import { ESCALATION_POLICY_STATE } from '@/schema/alert-manager/escalation-policy/constants';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import type { EscalationPolicyRulesType } from '@/schema/alert-manager/escalation-policy/type';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import ServiceDetailTabsSettingsEscalationPolicyForm
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEscalationPolicyForm.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { EscalationPolicyRadioType, EscalationPolicyModalType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    visible: boolean;
    type: EscalationPolicyModalType;
    selectedItem?: EscalationPolicyModel;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'CREATE',
    selectedItem: undefined,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'close'): void;
}>();

const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageGetters.serviceInfo.service_id),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    headerTitle: computed<TranslateResult>(() => {
        if (props.type === 'CREATE') return i18n.t('ALERT_MANAGER.ESCALATION_POLICY.MODAL_CREATE_TITLE');
        return i18n.t('ALERT_MANAGER.ESCALATION_POLICY.MODAL_SET_TITLE');
    }),
    radioMenuList: computed<EscalationPolicyRadioType[]>(() => [
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'),
            name: ALERT_STATUS.ACKNOWLEDGED,
        },
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'),
            name: ALERT_STATUS.RESOLVED,
        },
    ]),
    selectedRadioIdx: 0,
    rules: [{
        channels: [],
        escalate_minutes: 30,
    }] as EscalationPolicyRulesType[],
    repeatCount: 0,
    formValid: computed<boolean>(() => state.rules.every((r) => r.channels.length > 0)),
    isModalValid: computed<boolean>(() => isAllValid.value && state.formValid),
});

const {
    forms: { name },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (!value) return ' ';
        if (value.length > 40) return i18n.t('ALERT_MANAGER.ESCALATION_POLICY.NAME_INVALID_TEXT');
        return '';
    },
});

const handleClose = () => {
    state.proxyVisible = false;
};
const handleRouteDetail = () => {
    serviceDetailPageStore.setCurrentTab(SERVICE_DETAIL_TABS.NOTIFICATIONS);
    handleClose();
};
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        const params = {
            name: name.value,
            rules: state.rules,
            repeat: {
                state: ESCALATION_POLICY_STATE.DISABLED,
                count: state.repeatCount,
            },
            finish_condition: state.radioMenuList[state.selectedRadioIdx].name,
        };
        if (props.type === 'CREATE') {
            await SpaceConnector.clientV2.alertManager.escalationPolicy.create<EscalationPolicyCreateParameters>({
                service_id: storeState.serviceId,
                ...params,
            });
            showSuccessMessage(i18n.t('ALERT_MANAGER.ESCALATION_POLICY.ALT_S_CREATE_POLICY'), '');
        } else {
            await SpaceConnector.clientV2.alertManager.escalationPolicy.update<EscalationPolicyUpdateParameters>({
                escalation_policy_id: props.selectedItem?.escalation_policy_id || '',
                ...params,
            });
            showSuccessMessage(i18n.t('ALERT_MANAGER.ESCALATION_POLICY.ALT_S_UPDATE_POLICY'), '');
        }
        handleClose();
        emit('close');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};

watch(() => props.type, (type) => {
    if (type === 'CREATE') return;
    setForm('name', props.selectedItem?.name || '');
    state.selectedRadioIdx = state.radioMenuList.findIndex((r) => r.name === props.selectedItem?.finish_condition);
    state.rules = props.selectedItem?.rules;
    state.repeatCount = props.selectedItem?.repeat?.count || 0;
}, { immediate: true });
</script>

<template>
    <p-button-modal class="service-detail-tabs-settings-escalation-policy-create-modal"
                    :header-title="state.headerTitle"
                    :fade="true"
                    :backdrop="true"
                    :loading="state.loading"
                    :visible.sync="state.proxyVisible"
                    :disabled="!state.isModalValid"
                    @confirm="handleClickConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <p-field-group :label="$t('ALERT_MANAGER.ESCALATION_POLICY.LABEL_NAME')"
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               required
                               class="w-1/2"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="name"
                                      :invalid="invalid"
                                      block
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('ALERT_MANAGER.ESCALATION_POLICY.LABEL_FINISH_CONDITION')"
                               required
                >
                    <template #default>
                        <p-radio-group>
                            <p-radio v-for="(item, idx) in state.radioMenuList"
                                     :key="`bookmark-scope-${idx}`"
                                     v-model="state.selectedRadioIdx"
                                     :value="idx"
                            >
                                <span class="radio-item">
                                    {{ item.label }}
                                </span>
                            </p-radio>
                        </p-radio-group>
                    </template>
                </p-field-group>
                <p-field-group :label="$t('ALERT_MANAGER.ESCALATION_POLICY.LABEL_ESCALATION_RULES')"
                               required
                >
                    <template #help>
                        <div class="flex flex-col">
                            <span class="help-text">
                                {{ $t('ALERT_MANAGER.ESCALATION_POLICY.ESCALATION_RULES_HELP_TEXT') }}.
                            </span>
                            <p-text-button style-type="highlight"
                                           class="set-button"
                                           @click="handleRouteDetail"
                            >
                                {{ $t('ALERT_MANAGER.ESCALATION_POLICY.GO_SET_NOTIFICATION') }}
                            </p-text-button>
                        </div>
                    </template>
                    <service-detail-tabs-settings-escalation-policy-form :rules.sync="state.rules"
                                                                         :repeat-count.sync="state.repeatCount"
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.service-detail-tabs-settings-escalation-policy-create-modal {
    .modal-content-wrapper {
        .set-button {
            padding: 0;
        }
    }
}
</style>
