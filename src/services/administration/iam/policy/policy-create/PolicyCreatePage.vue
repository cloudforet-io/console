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
                    :invalid="isNameModified"
                    :invalid-text="$t('IAM.POLICY.FORM.VALIDATION_NAME')"
                >
                    <template #default="{invalid}">
                        <p-text-input
                            :value.sync="name"
                            :invalid="invalid"
                            :invalid-text="$t('IAM.POLICY.FORM.VALIDATION_NAME')"
                            @input="handleNameInput"
                        />
                    </template>
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <p-field-group :label="$t('IAM.POLICY.FORM.DESCRIPTION')">
                    <p-text-input />
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
            <p-button
                style-type="primary-dark"
                size="lg"
                :disabled="isNameModified"
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
import { reactive, toRefs, computed } from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceRouter } from '@/router';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { i18n } from '@/translations';

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
        const state = reactive({
            name: '',
            code: '',
        });

        const permissionsParser = (code: string) => code.split('\n').filter(d => d !== '');

        const handleNameInput = (inputtedName: string) => { state.name = inputtedName; };
        const handleCreatePolicy = async () => {
            try {
                await SpaceConnector.client.identity.policy.create({ permissions: permissionsParser(state.code), name: state.name });
                showSuccessMessage(i18n.t('IAM.POLICY.MODAL.ALT_S_CREATE_POLICY'), '');
                SpaceRouter.router.go(-1);
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.POLICY.MODAL.ALT_E_CREATE_POLICY'));
            }
        };

        const handleCodeUpdate = (modifiedCode: string) => { state.code = modifiedCode; };

        const isNameModified = computed(() => !(state.name.length >= 2));

        return {
            ...toRefs(state),
            handleCreatePolicy,
            handleNameInput,
            handleCodeUpdate,
            isNameModified,
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
