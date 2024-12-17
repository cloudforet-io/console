<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { AlertCreateParameters } from '@/schema/alert-manager/alert/api-verbs/create';
import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useAlertPageStore } from '@/services/alert-manager-v2/stores/alert-page-store';
import type { RadioType } from '@/services/alert-manager-v2/types/alert-manager-type';


interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageState.serviceList),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    alertList: [] as AlertModel[],

    selectedServiceId: '',
    radioMenuList: computed<RadioType[]>(() => [
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'),
            name: ALERT_URGENCY.HIGH,
        },
        {
            label: i18n.t('ALERT_MANAGER.ALERTS.LOW'),
            name: ALERT_URGENCY.HIGH,
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
        const duplicatedName = state.alertList?.find((item) => item.title === value);
        if (duplicatedName) {
            return i18n.t('ALERT_MANAGER.ALERTS.VALIDATION_NAME_UNIQUE');
        }
        return '';
    },
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.alert.create<AlertCreateParameters, AlertModel>({
            title: name.value,
            description: description.value,
            service_id: state.selectedServiceId,
            urgency: state.radioMenuList[state.selectedRadioIdx].name,
        });
    } finally {
        state.loading = false;
        handleClose();
    }
};
const handleClose = () => {
    state.proxyVisible = false;
};

const fetchAlertsList = async () => {
    try {
        state.alertList = await alertPageStore.fetchAlertsList();
    } catch (e) {
        ErrorHandler.handleError(e, true);
        state.alertList = [];
    }
};

onMounted(() => {
    fetchAlertsList();
});
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
