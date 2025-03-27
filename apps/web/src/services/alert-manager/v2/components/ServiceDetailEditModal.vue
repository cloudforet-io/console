<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { Service } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const storeState = reactive({
    serviceListMap: computed<ServiceReferenceMap>(() => serviceDetailPageGetters.serviceReferenceMap),
    service: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    disabled: computed<boolean>(() => invalidState.name || (storeState.service.name === name.value && storeState.service.description === description.value)),
});
const {
    forms: {
        name,
        description,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: storeState.service.name,
    description: storeState.service.description,
}, {
    name(value: string) {
        if (!value) return ' ';
        const duplicatedName = Object.values(storeState.serviceListMap)?.find((item) => item.label === value);
        if (duplicatedName) {
            return i18n.t('ALERT_MANAGER.SERVICE.VALIDATION_NAME_UNIQUE');
        }
        return '';
    },
});

const handleConfirm = async () => {
    state.loading = true;
    try {
        await serviceDetailPageStore.updateServiceDetailData({
            name: name.value,
            description: description.value || ' ',
        });
        await serviceDetailPageStore.fetchServiceDetailData(storeState.service.service_id);
    } finally {
        state.loading = false;
        handleClose();
    }
};
const handleClose = () => {
    state.proxyVisible = false;
};
</script>

<template>
    <p-button-modal class="service-detail-edit-modal"
                    :header-title="$t('ALERT_MANAGER.SERVICE.MODAL_EDIT_TITLE')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="state.proxyVisible"
                    :disabled="state.disabled"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group :label="$t('ALERT_MANAGER.SERVICE.LABEL_SERVICE_NAME')"
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               class="input-form"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="name"
                                      :invalid="invalid"
                                      class="text-input"
                                      block
                                      @update:value="setForm('name', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('ALERT_MANAGER.SERVICE.LABEL_KEY')"
                               class="input-form service-key"
                               required
                >
                    <p-text-input :value="storeState.service.service_key"
                                  readonly
                                  block
                    />
                </p-field-group>
                <p-field-group :label="$t('ALERT_MANAGER.DESCRIPTION')"
                               class="input-form"
                >
                    <p-textarea :value="description"
                                @update:value="setForm('description', $event)"
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.service-detail-edit-modal {
    .service-key {
        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            .input-container {
                @apply border-gray-150;
            }
        }
    }
}
</style>
