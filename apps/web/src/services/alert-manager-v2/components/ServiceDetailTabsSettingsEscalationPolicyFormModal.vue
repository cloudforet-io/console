<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PTextInput, PRadio, PFieldGroup, PRadioGroup, PTextButton,
} from '@cloudforet/mirinae';

import { ALERT_STATE } from '@/schema/alert-manager/alert/constants';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import ServiceDetailTabsSettingsEscalationPolicyForm
    from '@/services/alert-manager-v2/components/ServiceDetailTabsSettingsEscalationPolicyForm.vue';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';
import type { EscalationPolicyRadioType, EscalationPolicyModalType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface Props {
    visible: boolean;
    type: EscalationPolicyModalType;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'CREATE',
});

const serviceDetailPageStore = useServiceDetailPageStore();
const userStore = useUserStore();

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const state = reactive({
    proxyVisible: useProxyValue<boolean>('visible', props, emit),
    selectedEscalationPolicyId: undefined as string|undefined,
    headerTitle: computed<TranslateResult>(() => {
        if (props.type === 'CREATE') return i18n.t('ALERT_MANAGER.ESCALATION_POLICY.CREATE_MODAL_TITLE');
        return i18n.t('ALERT_MANAGER.ESCALATION_POLICY.SET_MODAL_TITLE');
    }),
    radioMenuList: computed<EscalationPolicyRadioType[]>(() => [
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'),
            name: ALERT_STATE.ACKNOWLEDGED,
        },
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'),
            name: ALERT_STATE.RESOLVED,
        },
    ]),
    selectedRadioIdx: 0,

    timezone: computed<string|undefined>(() => userStore.state.timezone),
    isModalValid: computed<boolean>(() => name.value === '' && !invalidState.name),
});

const {
    forms: { name },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (value === '') return '';
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
    console.log('TODO: handleClickConfirm');
    handleClose();
};
</script>

<template>
    <p-button-modal class="service-detail-tabs-settings-escalation-policy-create-modal"
                    :header-title="state.headerTitle"
                    :fade="true"
                    :backdrop="true"
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
                    <service-detail-tabs-settings-escalation-policy-form />
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
