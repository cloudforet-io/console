<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PHeading, PIconButton, PButtonModal, PFieldGroup, PTextInput,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import AnomalyDetectionConfigurationInformation
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationInformation.vue';
import AnomalyDetectionConfigurationRecipients
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationRecipients.vue';
import AnomalyDetectionConfigurationTrend
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationTrend.vue';

const MODAL_TYPE = {
    EDIT: 'edit',
    DELETE: 'delete',
} as const;

const modalState = reactive({
    modalVisible: false,
    type: '',
    title: computed<TranslateResult>(() => (modalState.type === MODAL_TYPE.EDIT
        ? i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.MODAL_EDIT_TITLE')
        : i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.MODAL_DELETE_TITLE'))),
});

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: '',
}, {
    name(value) {
        if (!value) return i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.NAME_REQUIRED');
        return true;
    },
});

const handleClickActionButton = (type: string) => {
    modalState.type = type;
    modalState.modalVisible = true;
};
</script>

<template>
    <div class="anomaly-detection-configuration-detail-page">
        <p-heading title="detail page"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        >
            <template #title-right-extra>
                <div class="toolbox-button-wrapper">
                    <p-icon-button name="ic_edit-text"
                                   @click="handleClickActionButton(MODAL_TYPE.EDIT)"
                    />
                    <p-icon-button name="ic_delete"
                                   @click="handleClickActionButton(MODAL_TYPE.DELETE)"
                    />
                </div>
            </template>
        </p-heading>
        <anomaly-detection-configuration-trend class="form" />
        <anomaly-detection-configuration-information class="form" />
        <anomaly-detection-configuration-recipients class="form" />
        <p-button-modal :visible.sync="modalState.modalVisible"
                        :header-title="modalState.title"
                        :theme-color="modalState.type === MODAL_TYPE.DELETE ? 'alert' : 'primary'"
                        size="sm"
        >
            <template #body>
                <span v-if="modalState.type === MODAL_TYPE.DELETE">
                    {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.MODAL_DELETE_DESC') }}
                </span>
                <p-field-group v-else
                               :label="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_NAME_PLACEHOLDER')"
                               required
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               class="field"
                >
                    <p-text-input :value="name"
                                  block
                                  :invalid="invalidState.name"
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
            </template>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-detail-page {
    .toolbox-button-wrapper {
        @apply flex items-center;
    }
    .form + .form {
        margin-top: 1rem;
    }
}
</style>
