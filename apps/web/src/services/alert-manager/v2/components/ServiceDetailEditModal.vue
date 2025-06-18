<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PButtonModal, PFieldGroup, PTextInput, PTextarea,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useServiceGetQuery } from '@/services/alert-manager/v2/composables/use-service-get-query';
import { useServiceUpdateMutation } from '@/services/alert-manager/v2/composables/use-service-update-mutation';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const route = useRoute();
const serviceId = computed<string>(() => route.params.serviceId as string);

const emit = defineEmits<{(e: 'update:visible'): void; }>();

const { serviceData } = useServiceGetQuery(serviceId.value);

const storeState = reactive({
    serviceListMap: computed<ServiceReferenceMap>(() => serviceDetailPageGetters.serviceReferenceMap),
});
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    disabled: computed<boolean>(() => invalidState.name || (serviceData.value?.name === name.value && serviceData.value?.description === description.value)),
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
    name: serviceData.value?.name || '',
    description: serviceData.value?.description || '',
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

const { mutate: updateService, isPending: updateServiceLoading } = useServiceUpdateMutation({
    onSettled: () => {
        handleClose();
    },
});

const handleConfirm = async () => {
    updateService({
        service_id: serviceId.value,
        name: name.value,
        description: description.value || ' ',
    });
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
                    :loading="updateServiceLoading"
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
                    <p-text-input :value="serviceData?.service_key"
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
