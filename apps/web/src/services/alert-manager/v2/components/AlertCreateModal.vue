<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea, PSelectDropdown, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { AlertCreateParameters } from '@/schema/alert-manager/alert/api-verbs/create';
import { ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
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
const alertPageState = alertPageStore.state;
const alertPageGetters = alertPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const route = useRoute();

const storeState = reactive({
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageGetters.serviceDropdownList),
    alertListQuery: computed<Query|undefined>(() => alertPageState.alertListQuery),
});
const state = reactive({
    loading: false,
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
        await alertPageStore.fetchAlertsList({
            query: storeState.alertListQuery,
        });
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
