<script setup lang="ts">
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { AlertCreateParameters } from '@/schema/alert-manager/alert/api-verbs/create';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertPageStore } from '@/services/alert-manager/stores/alert-page-store';
import type { AlertUrgencyRadioType } from '@/services/alert-manager/types/alert-manager-type';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;
const alertPageGetters = alertPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageGetters.serviceDropdownList),
    alertListParams: computed<AlertListParameters|undefined>(() => alertPageState.alertListParams),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),

    selectedServiceId: '',
    radioMenuList: computed<AlertUrgencyRadioType[]>(() => [
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'),
            name: ALERT_URGENCY.HIGH,
        },
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.LOW'),
            name: ALERT_URGENCY.LOW,
        },
    ]),
    selectedRadioIdx: 0,
});
const {
    forms: {
        name,
        description,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
    description: '',
}, {
    name(value: string) {
        if (!value) return ' ';
        return '';
    },
});

const handleClose = () => {
    state.proxyVisible = false;
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.alert.create<AlertCreateParameters, AlertModel>({
            title: name.value,
            description: description.value,
            service_id: state.selectedServiceId,
            urgency: state.radioMenuList[state.selectedRadioIdx].name,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_CREATE'), '');
        await alertPageStore.fetchAlertsList(storeState.alertListParams);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
        handleClose();
    }
};
</script>

<template>
    <p-button-modal class="alert-create-modal"
                    :header-title="$t('ALERT_MANAGER.ALERTS.CREATE_ALERT')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :disabled="!isAllValid || !state.selectedServiceId"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group :label="$t('ALERT_MANAGER.ALERTS.LABEL_NAME')"
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               class="input-form"
                               required
                >
                    <p-text-input :value="name"
                                  :invalid="invalidState.name"
                                  block
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('ALERT_MANAGER.ALERTS.LABEL_URGENCY')"
                               required
                >
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
                </p-field-group>
                <p-field-group :label="$t('ALERT_MANAGER.ALERTS.SERVICE')"
                               required
                >
                    <p-select-dropdown :menu="storeState.serviceDropdownList"
                                       use-fixed-menu-style
                                       block
                                       show-delete-all-button
                                       :selected.sync="state.selectedServiceId"
                    />
                </p-field-group>
                <p-field-group :label="$t('ALERT_MANAGER.ALERTS.DESC')"
                               class="input-form"
                >
                    <p-textarea :value="description"
                                block
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>
