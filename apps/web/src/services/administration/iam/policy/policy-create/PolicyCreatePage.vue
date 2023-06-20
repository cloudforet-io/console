<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PPaneLayout, PBadge, PFieldTitle, PFieldGroup, PTextInput, PTextEditor, PButton,
} from '@spaceone/design-system';
import {
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const { t } = useI18n();
const router = useRouter();

const {
    forms: {
        policyName,
        policyCode,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    policyName: '',
    policyCode: '',
}, {
    policyName(value: string) { return value.trim().length > 2 ? '' : i18n.t('IAM.POLICY.FORM.VALIDATION_NAME'); },
    policyCode(value: string) { return value.trim().length ? '' : false; },
});

const state = reactive({
    description: '',
});

const permissionsParser = (code: string) => code.split('\n').filter((d) => d !== '');

const handleCreatePolicy = async () => {
    try {
        await SpaceConnector.client.identity.policy.create({
            name: policyName.value?.trim(),
            tags: {
                description: state.description,
            },
            permissions: permissionsParser(policyCode.value),
        });
        showSuccessMessage(t('IAM.POLICY.MODAL.ALT_S_CREATE_POLICY'), '');
        await router.push({ name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME, query: { policy_type: POLICY_TYPES.CUSTOM } });
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, t('IAM.POLICY.MODAL.ALT_E_CREATE_POLICY'));
    }
};

</script>

<template>
    <section class="policy-create-page">
        <p-heading
            show-back-button
            :title="t('IAM.POLICY.FORM.CREATE_TITLE')"
            @click-back-button="router.go(-1)"
        />
        <p-pane-layout class="policy-create-info-wrapper">
            <div class="policy-create-contents">
                <p-field-title>{{ t('IAM.POLICY.FORM.TYPE') }}</p-field-title>
                <br>
                <p-badge badge-type="solid-outline"
                         style-type="primary1"
                >
                    {{ t('IAM.POLICY.FORM.CUSTOM_POLICY') }}
                </p-badge>
            </div>
            <div class="policy-create-contents">
                <p-field-group
                    :label="t('IAM.POLICY.MODAL.NAME')"
                    required
                    :invalid="invalidState.policyName"
                    :invalid-text="invalidTexts.policyName"
                >
                    <template #default="{invalid}">
                        <p-text-input
                            :value="policyName"
                            :invalid="invalid"
                            @update:value="setForm('policyName', $event)"
                        />
                    </template>
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <p-field-group :label="t('IAM.POLICY.FORM.DESCRIPTION')">
                    <p-text-input v-model="state.description" />
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <p-field-group :label="t('IAM.POLICY.FORM.PERMISSION')"
                               required
                />
                <p-text-editor :code="policyCode"
                               @update:code="setForm('policyCode', $event)"
                />
            </div>
        </p-pane-layout>
        <div class="policy-modify-buttons">
            <p-button style-type="tertiary"
                      size="lg"
                      @click="router.go(-1)"
            >
                {{ t('IAM.POLICY.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      :disabled="!isAllValid"
                      @click="handleCreatePolicy"
            >
                {{ t('IAM.POLICY.FORM.CREATE') }}
            </p-button>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.policy-create-page {
    /* custom design-system component - p-pane-layout */
    :deep(.policy-create-info-wrapper) {
        padding: 1.125rem 1rem 2.5rem;
    }

    .policy-create-contents {
        margin-bottom: 1.125rem;
        .p-text-input {
            width: 70%;
        }
    }

    .policy-modify-buttons {
        @apply inline-flex;
        float: right;
        margin-top: 1rem;

        /* custom design-system component - p-button */
        :deep(.p-button) {
            margin-left: 1rem;
        }
    }

    /* custom design-system component - p-text-editor */
    :deep(.p-text-editor) {
        min-height: 30rem;
    }
}
</style>
