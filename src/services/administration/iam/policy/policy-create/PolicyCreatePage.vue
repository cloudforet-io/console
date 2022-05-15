<template>
    <section class="policy-create-page">
        <p-page-title
            child
            :title="$t('IAM.POLICY.FORM.CREATE_TITLE')"
            @goBack="$router.go(-1)"
        />
        <p-pane-layout class="policy-create-info-wrapper">
            <div class="policy-create-contents">
                <p-label>{{ $t('IAM.POLICY.FORM.TYPE') }}</p-label>
                <br>
                <p-badge outline style-type="primary1">
                    {{ $t('IAM.POLICY.FORM.CUSTOM_POLICY') }}
                </p-badge>
            </div>
            <div class="policy-create-contents">
                <p-field-group
                    :label="$t('IAM.POLICY.MODAL.NAME')"
                    required
                    :invalid="invalidState.policyName"
                    :invalid-text="invalidTexts.policyName"
                >
                    <template #default="{invalid}">
                        <p-text-input
                            :value="policyName"
                            :invalid="invalid"
                            @input="setForm('policyName', $event)"
                        />
                    </template>
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <p-field-group :label="$t('IAM.POLICY.FORM.DESCRIPTION')">
                    <p-text-input v-model="description" />
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <p-field-group :label="$t('IAM.POLICY.FORM.CONTENT')" required />
                <p-text-editor :code="code" @update:code="handleCodeUpdate" />
            </div>
        </p-pane-layout>
        <div class="policy-modify-buttons">
            <p-button
                style-type="gray-border"
                size="lg"
                @click="$router.go(-1)"
            >
                {{ $t('IAM.POLICY.FORM.CANCEL') }}
            </p-button>
            <!-- Apply disabled prop as isAllValid -->
            <p-button
                style-type="primary-dark"
                size="lg"
                :disabled="!(policyName.length > 2 && code.length)"
                @click="handleCreatePolicy"
            >
                {{ $t('IAM.POLICY.FORM.CREATE') }}
            </p-button>
        </div>
    </section>
</template>

<script lang="ts">
import {
    PPageTitle, PPaneLayout, PBadge, PLabel, PFieldGroup, PTextInput, PTextEditor, PButton,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceRouter } from '@/router';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { i18n } from '@/translations';
import { useFormValidator } from '@/common/composables/form-validator';

export default {
    name: 'PolicyCreatePage',
    components: {
        PPageTitle,
        PPaneLayout,
        PBadge,
        PLabel,
        PFieldGroup,
        PTextInput,
        PTextEditor,
        PButton,
    },
    setup() {
        const {
            forms: {
                policyName,
            },
            setForm,
            invalidState,
            invalidTexts,
        } = useFormValidator({
            policyName: '',
        }, {
            policyName(value: string) { return value.trim().length > 2 ? '' : i18n.t('IAM.POLICY.FORM.VALIDATION_NAME'); },
        });

        const state = reactive({
            description: '',
            code: '',
        });

        const permissionsParser = (code: string) => code.split('\n').filter(d => d !== '');

        const handleCreatePolicy = async () => {
            try {
                await SpaceConnector.client.identity.policy.create({
                    name: policyName.value,
                    tags: {
                        description: state.description,
                    },
                    permissions: permissionsParser(state.code),
                });
                showSuccessMessage(i18n.t('IAM.POLICY.MODAL.ALT_S_CREATE_POLICY'), '');
                SpaceRouter.router.go(-1);
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.POLICY.MODAL.ALT_E_CREATE_POLICY'));
            }
        };

        const handleCodeUpdate = (modifiedCode: string) => { state.code = modifiedCode; };

        return {
            ...toRefs(state),
            handleCreatePolicy,
            handleCodeUpdate,
            policyName,
            setForm,
            invalidState,
            invalidTexts,
        };
    },
};
</script>

<style lang="postcss" scoped>
.policy-create-page::v-deep {
    .policy-create-info-wrapper {
        padding: 1.125rem 1rem 2.5rem;
    }

    .policy-create-contents {
        margin-bottom: 1.125rem;
    }

    .policy-modify-buttons {
        @apply inline-flex;
        float: right;
        margin-top: 1rem;

        & .p-button {
            margin-left: 1rem;
        }
    }

    .p-text-editor {
        & .CodeMirror {
            min-height: 480px;
        }
    }
}
</style>
