<template>
    <section>
        <p-page-title
            child
            :title="policyName"
            @goBack="$router.go(-1)"
        >
            <template #title-right-extra>
                <span v-if="type === POLICY_TYPES.MANAGED"
                      class="policy-managed-badge"
                >
                    <p-badge badge-type="subtle"
                             style-type="gray200"
                    >{{ $t('IAM.POLICY.FORM.VIEW_ONLY') }}</p-badge>
                </span>
                <span v-if="type === POLICY_TYPES.CUSTOM"
                      class="policy-edit-buttons"
                >
                    <p-icon-button name="ic_trashcan"
                                   :disabled="!hasManagePermission"
                                   class="w-full delete-btn"
                                   @click="handleVisibleDeleteModal"
                    />
                    <p-icon-button name="ic_edit-text"
                                   :disabled="!hasManagePermission"
                                   class="edit-btn"
                                   @click="handleVisibleTitleEditModal"
                    />
                </span>
                <div v-if="type === POLICY_TYPES.CUSTOM"
                     class="policy-modify-buttons"
                >
                    <p-button :disabled="!isCodeModified && !isDescriptionModified"
                              style-type="tertiary"
                              @click="$router.back()"
                    >
                        {{ $t('IAM.POLICY.FORM.CANCEL') }}
                    </p-button>
                    <p-button :disabled="!isCodeModified && !isDescriptionModified"
                              style-type="primary"
                              @click="handleSaveChanges"
                    >
                        {{ $t('IAM.POLICY.FORM.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-page-title>
        <p-pane-layout class="policy-detail-info-wrapper">
            <div class="policy-detail-contents">
                <p-field-title>{{ $t('IAM.POLICY.FORM.TYPE') }}</p-field-title>
                <br>
                <div class="policy-detail-type-badge">
                    <p-badge v-if="type === POLICY_TYPES.MANAGED"
                             badge-type="solid-outline"
                             style-type="gray500"
                    >
                        {{ $t('IAM.POLICY.FORM.MANAGED_POLICY') }}
                    </p-badge>
                    <p-badge v-else
                             badge-type="solid-outline"
                             style-type="primary1"
                    >
                        {{ $t('IAM.POLICY.FORM.CUSTOM_POLICY') }}
                    </p-badge>
                </div>
            </div>
            <div class="policy-detail-contents">
                <p-field-title>{{ $t('IAM.POLICY.FORM.ID') }}</p-field-title>
                <p>{{ policyInfo ? policyInfo.policy_id : '' }}</p>
            </div>
            <div class="policy-detail-contents">
                <div v-if="type === POLICY_TYPES.MANAGED">
                    <p-field-title>
                        {{ $t('IAM.POLICY.FORM.DESCRIPTION') }}
                    </p-field-title>
                    <br>
                    <p>{{ policyInfo ? policyInfo.tags.description : '' }}</p>
                </div>
                <p-field-group
                    v-else
                    :label="$t('IAM.POLICY.FORM.DESCRIPTION')"
                >
                    <p-text-input
                        v-model="description"
                        :disabled="!hasManagePermission"
                        @update:value="handleDescriptionUpdate"
                    />
                </p-field-group>
            </div>
            <div class="policy-detail-contents">
                <p-field-title>{{ $t('IAM.POLICY.FORM.PERMISSION') }}</p-field-title>
                <p-text-editor
                    :read-only="(type === POLICY_TYPES.MANAGED || !hasManagePermission)"
                    :code="code"
                    @update:code="handleCodeUpdate"
                />
            </div>
        </p-pane-layout>
        <policy-delete-modal :visible.sync="visibleDeleteModal"
                             :policy-id="id"
        />
        <policy-name-edit-modal :visible.sync="visibleTitleEditModal"
                                :policy-id="id"
                                :policy-name="policyName"
        />
    </section>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, defineComponent, onUnmounted,
} from 'vue';

import {
    PPageTitle, PIconButton, PBadge, PPaneLayout, PFieldTitle, PTextEditor, PButton, PTextInput, PFieldGroup,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import type { PolicyDetailPageProps } from '@/services/administration/iam/policy/lib/type';
import PolicyDeleteModal from '@/services/administration/iam/policy/modules/PolicyDeleteModal.vue';
import PolicyNameEditModal from '@/services/administration/iam/policy/modules/PolicyNameEditModal.vue';
import { administrationStore } from '@/services/administration/store';

export default defineComponent<PolicyDetailPageProps>({
    name: 'PolicyDetailPage',
    components: {
        PPageTitle,
        PIconButton,
        PBadge,
        PPaneLayout,
        PFieldTitle,
        PTextEditor,
        PButton,
        PTextInput,
        PolicyDeleteModal,
        PolicyNameEditModal,
        PFieldGroup,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const stringifyPermission = (permissions: Array<string>|undefined) => permissions?.toString().replace(/,/gi, '\n') ?? '';
        const arrayifyPermission = (permissionsCode: string) => permissionsCode.split('\n');

        const state = reactive({
            hasManagePermission: useManagePermissionState(),
            policyInfo: computed(() => administrationStore.state.policy.policyData),
            policyName: computed(() => state.policyInfo?.name || ''),
            type: SpaceRouter.router.currentRoute.query.type,
            code: '',
            isCodeModified: false,
            description: '',
            isDescriptionModified: false,
            visibleDeleteModal: false,
            visibleTitleEditModal: false,
        });

        const handleCodeUpdate = (modifiedCode: string) => {
            state.isCodeModified = modifiedCode !== stringifyPermission(state.policyInfo?.permissions);
            state.code = modifiedCode;
        };

        const handleDescriptionUpdate = (modifiedDescription: string) => {
            state.isDescriptionModified = modifiedDescription !== state.policyInfo?.tags?.description ?? '';
            state.description = modifiedDescription;
        };

        const handleVisibleDeleteModal = () => { state.visibleDeleteModal = true; };
        const handleVisibleTitleEditModal = () => { state.visibleTitleEditModal = true; };

        const handleSaveChanges = () => {
            try {
                SpaceConnector.client.identity.policy.update({
                    policy_id: props.id,
                    permissions: arrayifyPermission(state.code),
                    tags: {
                        description: state.description,
                    },
                });
                showSuccessMessage(i18n.t('IAM.POLICY.MODAL.ALT_S_CHANGE_POLICY'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.POLICY.MODAL.ALT_E_CHANGE_POLICY'));
            }
        };

        const getPolicyStoreData = () => {
            state.code = stringifyPermission(administrationStore.state.policy.policyData?.permissions) ?? '';
            state.description = administrationStore.state.policy.policyData?.tags?.description ?? '';
        };

        onUnmounted(() => {
            administrationStore.commit('policy/setPolicyData', null);
        });

        (async () => {
            const policyType = SpaceRouter.router.currentRoute.query.type;

            try {
                await administrationStore.dispatch('policy/getPolicyData', { policyId: props.id, policyType });
                await getPolicyStoreData();
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        })();

        return {
            ...toRefs(state),
            POLICY_TYPES,
            handleCodeUpdate,
            handleDescriptionUpdate,
            handleVisibleDeleteModal,
            handleVisibleTitleEditModal,
            handleSaveChanges,
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
        .p-text-input {
            width: 70%;
        }
        & p {
            @apply text-sm text-gray-900;
        }
    }
}
</style>
