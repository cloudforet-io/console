<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import { ALERT_URGENCY } from '@/api-clients/alert-manager/alert/schema/constants';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/v2/stores/alert-page-store';
import type { AlertUrgencyRadioType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    visible: boolean;
    serviceId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    serviceId: undefined,
});

const alertPageStore = useAlertPageStore();
const alertPageGetters = alertPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const route = useRoute();

const queryClient = useQueryClient();
const { alertAPI } = useAlertApi();
const { key: alertListQueryKey } = useServiceQueryKey('alert-manager', 'alert', 'list');

const storeState = reactive({
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageGetters.serviceDropdownList),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    isServicePage: route.name === ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,

    selectedServiceId: props.serviceId || '',
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

const { mutate: createAlert, isPending } = useMutation({
    mutationFn: alertAPI.create,
    onSuccess: () => {
        showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_CREATE'), '');
        queryClient.invalidateQueries({ queryKey: alertListQueryKey.value });
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
    onSettled: () => {
        handleClose();
    },
});

const handleClose = () => {
    state.proxyVisible = false;
};
const handleConfirm = async () => {
    createAlert({
        title: name.value,
        description: description.value,
        service_id: state.selectedServiceId,
        urgency: state.radioMenuList[state.selectedRadioIdx].name,
    });
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
                    :loading="isPending"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group :label="$t('ALERT_MANAGER.ALERTS.LABEL_NAME')"
                               class="input-form"
                               :invalid="invalidState.name"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="name"
                                      block
                                      :invalid="invalid"
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
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
                                       :disabled="props.serviceId !== undefined"
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
