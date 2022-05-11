<template>
    <section>
        <!--        song-lang-->
        <p-page-title
            child
            title="Create Custom Policy"
            @goBack="$router.go(-1)"
        />
        <p-pane-layout class="policy-create-info-wrapper">
            <div class="policy-create-contents">
                <p-label>Type</p-label>
                <br>
                <!--            song-lang-->
                <p-badge outline style-type="primary1">
                    Custom Policy
                </p-badge>
            </div>
            <div class="policy-create-contents">
                <!--                song-lang-->
                <p-field-group label="Name" required>
                    <p-text-input />
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <!--                song-lang-->
                <p-field-group label="Description">
                    <p-text-input />
                </p-field-group>
            </div>
            <div class="policy-create-contents">
                <!--            song-lang-->
                <p-field-group label="Content" />
                <p-text-editor :code="code" />
            </div>
        </p-pane-layout>
        <div class="policy-modify-buttons">
            <!--            song-lang-->
            <p-button style-type="gray-border" size="lg">
                Cancel
            </p-button>
            <!--            song-lang-->
            <p-button style-type="primary-dark" size="lg">
                Create
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
