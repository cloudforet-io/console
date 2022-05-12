<template>
    <section>
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
                <p-field-group :label="$t('IAM.POLICY.MODAL.NAME')" required>
                    <p-text-input />
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <p-field-group :label="$t('IAM.POLICY.FORM.DESCRIPTION')">
                    <p-text-input />
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <p-field-group :label="$t('IAM.POLICY.FORM.CONTENT')" />
                <p-text-editor :code="code" />
            </div>
        </p-pane-layout>
        <div class="policy-modify-buttons">
            <p-button style-type="gray-border" size="lg">
                {{ $t('IAM.POLICY.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark" size="lg">
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
            code: '{}',
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
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
</style>
