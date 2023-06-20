<script setup lang="ts">
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PIconButton, PBadge, PPaneLayout, PFieldTitle, PTextEditor, PButton, PTextInput, PFieldGroup,
} from '@spaceone/design-system';
import {
    computed, reactive, defineProps,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import type { PolicyDetailPageProps } from '@/services/administration/iam/policy/lib/type';
import PolicyDeleteModal from '@/services/administration/iam/policy/policy-detail/modules/PolicyDeleteModal.vue';
import PolicyNameEditModal from '@/services/administration/iam/policy/policy-detail/modules/PolicyNameEditModal.vue';
import { usePolicyStore } from '@/services/administration/store/policy-page-store';
import type { PolicyType } from '@/services/administration/store/type';
import { POLICY_TYPE } from '@/services/administration/store/type';


const policyStore = usePolicyStore();
const policyState = policyStore.$state;

const stringifyPermission = (permissions: Array<string>|undefined) => permissions?.toString().replace(/,/gi, '\n') ?? '';
const arrayifyPermission = (permissionsCode: string) => permissionsCode.split('\n');

interface PolicyDetailPageProps {
    id: string;
}
const props = withDefaults(defineProps<PolicyDetailPageProps>(), {
    id: '',
});

const router = useRouter();
const { t } = useI18n();

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    policyName: computed(() => policyState.policyData?.name || ''),
    policyType: computed(() => router.currentRoute.value.query.type as PolicyType),
    code: '',
    isCodeModified: false,
    description: '',
    isDescriptionModified: false,
    visibleDeleteModal: false,
    visibleTitleEditModal: false,
});

const handleCodeUpdate = (modifiedCode: string) => {
    state.isCodeModified = modifiedCode !== stringifyPermission(policyState.policyData?.permissions);
    state.code = modifiedCode;
};

const handleDescriptionUpdate = (modifiedDescription: string) => {
    state.isDescriptionModified = modifiedDescription !== policyState.policyData?.tags?.description ?? '';
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
        showSuccessMessage(t('IAM.POLICY.MODAL.ALT_S_CHANGE_POLICY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('IAM.POLICY.MODAL.ALT_E_CHANGE_POLICY'));
    }
};

const getPolicyData = async () => {
    await policyStore.getPolicyData(props.id, state.policyType);
    state.code = stringifyPermission(policyState.policyData?.permissions) ?? '';
    state.description = policyState.policyData?.tags?.description ?? '';
};

(async () => {
    await getPolicyData();
})();
</script>

<template>
    <section>
        <p-heading
            show-back-button
            :title="state.policyName"
            @click-back-button="router.go(-1)"
        >
            <template #title-right-extra>
                <span v-if="state.policyType === POLICY_TYPE.MANAGED"
                      class="policy-managed-badge"
                >
                    <p-badge badge-type="subtle"
                             style-type="gray200"
                    >{{ t('IAM.POLICY.FORM.VIEW_ONLY') }}</p-badge>
                </span>
                <span v-if="state.policyType === POLICY_TYPE.CUSTOM"
                      class="policy-edit-buttons"
                >
                    <p-icon-button name="ic_delete"
                                   :disabled="!state.hasManagePermission"
                                   class="w-full delete-btn"
                                   @click="handleVisibleDeleteModal"
                    />
                    <p-icon-button name="ic_edit-text"
                                   :disabled="!state.hasManagePermission"
                                   class="edit-btn"
                                   @click="handleVisibleTitleEditModal"
                    />
                </span>
                <div v-if="state.policyType === POLICY_TYPE.CUSTOM"
                     class="policy-modify-buttons"
                >
                    <p-button :disabled="!state.isCodeModified && !state.isDescriptionModified"
                              style-type="tertiary"
                              @click="router.back()"
                    >
                        {{ t('IAM.POLICY.FORM.CANCEL') }}
                    </p-button>
                    <p-button :disabled="!state.isCodeModified && !state.isDescriptionModified"
                              style-type="primary"
                              @click="handleSaveChanges"
                    >
                        {{ t('IAM.POLICY.FORM.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-pane-layout class="policy-detail-info-wrapper">
            <div class="policy-detail-contents">
                <p-field-title>{{ t('IAM.POLICY.FORM.TYPE') }}</p-field-title>
                <br>
                <div class="policy-detail-type-badge">
                    <p-badge v-if="state.policyType === POLICY_TYPE.MANAGED"
                             badge-type="solid-outline"
                             style-type="gray500"
                    >
                        {{ t('IAM.POLICY.FORM.MANAGED_POLICY') }}
                    </p-badge>
                    <p-badge v-else
                             badge-type="solid-outline"
                             style-type="primary1"
                    >
                        {{ t('IAM.POLICY.FORM.CUSTOM_POLICY') }}
                    </p-badge>
                </div>
            </div>
            <div class="policy-detail-contents">
                <p-field-title>{{ t('IAM.POLICY.FORM.ID') }}</p-field-title>
                <p>{{ policyState.policyData ? policyState.policyData?.policy_id : '' }}</p>
            </div>
            <div class="policy-detail-contents">
                <div v-if="state.policyType === POLICY_TYPE.MANAGED">
                    <p-field-title>
                        {{ t('IAM.POLICY.FORM.DESCRIPTION') }}
                    </p-field-title>
                    <br>
                    <p>{{ policyState.policyData ? policyState.policyData?.tags?.description : '' }}</p>
                </div>
                <p-field-group
                    v-else
                    :label="t('IAM.POLICY.FORM.DESCRIPTION')"
                >
                    <p-text-input
                        v-model="state.description"
                        :disabled="!state.hasManagePermission"
                        @update:value="handleDescriptionUpdate"
                    />
                </p-field-group>
            </div>
            <div class="policy-detail-contents">
                <p-field-title>{{ t('IAM.POLICY.FORM.PERMISSION') }}</p-field-title>
                <p-text-editor
                    :read-only="(state.policyType === POLICY_TYPE.MANAGED || !state.hasManagePermission)"
                    :code="state.code"
                    @update:code="handleCodeUpdate"
                />
            </div>
        </p-pane-layout>
        <policy-delete-modal v-model:visible="state.visibleDeleteModal"
                             :policy-id="id"
        />
        <policy-name-edit-modal v-model:visible="state.visibleTitleEditModal"
                                :policy-id="id"
                                :policy-name="state.policyName"
        />
    </section>
</template>

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
