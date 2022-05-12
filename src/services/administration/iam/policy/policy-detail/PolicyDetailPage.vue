<template>
    <section>
        <p-page-title
            child
            :title="policyInfo.name"
            @goBack="$router.go(-1)"
        >
            <template #title-right-extra>
                <span v-if="type === POLICY_TYPES.MANAGED" class="policy-managed-badge">
                    <p-badge style-type="gray200">{{ $t('IAM.POLICY.FORM.VIEW_ONLY') }}</p-badge>
                </span>
                <span v-if="type === POLICY_TYPES.CUSTOM" class="policy-edit-buttons">
                    <p-icon-button name="ic_trashcan" class="w-full delete-btn" @click="handlerVisibleDeleteModal" />
                    <p-icon-button name="ic_edit-text" class="edit-btn" @click="handlerVisibleNameEditModal" />
                </span>
                <div v-if="type === POLICY_TYPES.CUSTOM" class="policy-modify-buttons">
                    <p-button :disabled="!isCodeModified && !isDescriptionModified" style-type="gray-border">
                        {{ $t('IAM.POLICY.FORM.CANCEL') }}
                    </p-button>
                    <p-button :disabled="!isCodeModified && !isDescriptionModified" style-type="primary-dark">
                        {{ $t('IAM.POLICY.FORM.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-page-title>
        <p-pane-layout class="policy-detail-info-wrapper">
            <div class="policy-detail-contents">
                <p-label>{{ $t('IAM.POLICY.FORM.TYPE') }}</p-label>
                <br>
                <div class="policy-detail-type-badge">
                    <p-badge v-if="type === POLICY_TYPES.MANAGED" outline style-type="gray">
                        {{ $t('IAM.POLICY.FORM.MANAGED_POLICY') }}
                    </p-badge>
                    <p-badge v-else outline style-type="primary1">
                        {{ $t('IAM.POLICY.FORM.CUSTOM_POLICY') }}
                    </p-badge>
                </div>
            </div>
            <div class="policy-detail-contents">
                <p-label>{{ $t('IAM.POLICY.FORM.ID') }}</p-label>
                <p>{{ policyInfo.policy_id }}</p>
            </div>
            <div class="policy-detail-contents">
                <p-label>
                    {{ $t('IAM.POLICY.FORM.DESCRIPTION') }}
                </p-label>
                <br>
                <p v-if="type === POLICY_TYPES.MANAGED">
                    {{ policyInfo.tags.description }}
                </p>
                <p-text-input
                    v-else
                    :value="description"
                    @input="handleDescriptionUpdate"
                />
            </div>
            <div class="policy-detail-contents">
                <p-label>{{ $t('IAM.POLICY.FORM.CONTENT') }}</p-label>
                <p-text-editor
                    :mode="type === POLICY_TYPES.MANAGED ? 'readOnly' : 'edit'"
                    :code="code"
                    @update:code="handleCodeUpdate"
                />
            </div>
        </p-pane-layout>
        <policy-delete-modal :visible.sync="visibleDeleteModal" :attached-roles="attachedRoles" />
        <policy-name-edit-modal :visible.sync="visibleNameEditModal" />
    </section>
</template>

<script lang="ts">
import { administrationStore } from '@/services/administration/store';
import {
    PPageTitle, PIconButton, PBadge, PPaneLayout, PLabel, PTextEditor, PButton, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, defineComponent,
} from '@vue/composition-api';
import { PolicyDetailPageProps } from '@/services/administration/iam/policy/lib/type';
import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import { SpaceRouter } from '@/router';
import PolicyDeleteModal from '@/services/administration/iam/policy/modules/PolicyDeleteModal.vue';
import PolicyNameEditModal from '@/services/administration/iam/policy/modules/PolicyNameEditModal.vue';
import deleteModal from '@/common/components/modals/DeleteModal.vue';

export default defineComponent<PolicyDetailPageProps>({
    name: 'PolicyDetailPage',
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    components: {
        PPageTitle,
        PIconButton,
        PBadge,
        PPaneLayout,
        PLabel,
        PTextEditor,
        PButton,
        PTextInput,
        PolicyDeleteModal,
        PolicyNameEditModal,
        deleteModal,
    },
    setup(props) {
        const state = reactive({
            policyInfo: computed(() => administrationStore.state.policy.policyData),
            type: SpaceRouter.router.currentRoute.query.type,
            code: computed(() => JSON.stringify(administrationStore.state.policy.policyData, undefined, 4)),
            isCodeModified: false,
            description: computed(() => administrationStore.state.policy.policyData?.tags?.description ?? ''),
            isDescriptionModified: false,
            visibleDeleteModal: false,
            visibleNameEditModal: false,
            attachedRoles: true,
        });

        const handleCodeUpdate = (modifiedCode: string) => {
            state.isCodeModified = modifiedCode !== JSON.stringify(state.policyInfo, undefined, 4);
            state.code = modifiedCode;
        };

        const handleDescriptionUpdate = (modifiedDescription: string) => {
            state.isDescriptionModified = modifiedDescription !== state.policyInfo?.tags?.description ?? '';
            state.description = modifiedDescription;
        };

        const handlerVisibleDeleteModal = () => { state.visibleDeleteModal = true; };
        const handlerVisibleNameEditModal = () => { state.visibleNameEditModal = true; };

        (async () => {
            try {
                await administrationStore.dispatch('policy/getPolicyData', props.id);
            } catch (e) {
                console.error(e);
            }
        })();

        return {
            ...toRefs(state),
            POLICY_TYPES,
            handleCodeUpdate,
            handleDescriptionUpdate,
            handlerVisibleDeleteModal,
            handlerVisibleNameEditModal,
        };
    },
});
</script>

<style lang="postcss" scoped>
.policy-edit-buttons {
    @apply inline-flex;
}
.policy-modify-buttons {
    @apply inline-flex;
    float: right;
    & .p-button {
        margin-left: 1rem;
    }
}
.policy-detail-info-wrapper {
    padding: 1.125rem 1rem 2.5rem;
    .policy-detail-type-badge {
        margin-top: 0.25rem;
    }
    .policy-detail-contents {
        margin-bottom: 1.125rem;
        & p {
            @apply text-sm text-gray-900;
        }
    }
}
</style>
