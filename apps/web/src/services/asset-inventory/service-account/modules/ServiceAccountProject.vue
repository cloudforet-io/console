<template>
    <p-pane-layout class="service-account-project">
        <p-heading heading-type="sub"
                   :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')"
        >
            <template #extra>
                <p-button v-if="mode === 'READ' && editable"
                          style-type="transparent"
                          icon-left="ic_edit"
                          @click="handleClickEditButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                </p-button>
                <div v-if="mode === 'UPDATE'"
                     class="button-wrapper"
                >
                    <p-button style-type="transparent"
                              @click="handleClickCancelButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!isFormValid"
                              @click="handleClickSaveButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <div v-if="!serviceAccountLoading"
             class="content-wrapper"
        >
            <service-account-project-detail v-if="mode === 'READ'"
                                            :project-id="projectId"
                                            :service-account-type="serviceAccountType"
            />
            <service-account-project-form v-else
                                          :project-id="projectId"
                                          :is-valid.sync="isFormValid"
                                          @change="handleChangeForm"
            />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    defineComponent, reactive, toRefs,
} from 'vue';

import {
    PPaneLayout, PHeading, PButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import ServiceAccountProjectDetail
    from '@/services/asset-inventory/service-account/modules/ServiceAccountProjectDetail.vue';
import ServiceAccountProjectForm
    from '@/services/asset-inventory/service-account/modules/ServiceAccountProjectForm.vue';
import type { ProjectForm, AccountType, PageMode } from '@/services/asset-inventory/service-account/type';

interface Props {
    serviceAccountId?: string;
    serviceAccountType: AccountType;
    projectId?: string;
    editable: boolean;
}

export default defineComponent<Props>({
    name: 'ServiceAccountProject',
    components: {
        ServiceAccountProjectDetail,
        ServiceAccountProjectForm,
        PPaneLayout,
        PHeading,
        PButton,
    },
    props: {
        serviceAccountLoading: {
            type: Boolean,
            default: false,
        },
        serviceAccountId: {
            type: String,
            default: undefined,
        },
        serviceAccountType: {
            type: String as PropType<AccountType>,
            default: 'GENERAL',
        },
        projectId: {
            type: String,
            default: undefined,
        },
        editable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            mode: 'READ' as PageMode,
            isFormValid: undefined,
            projectForm: {} as ProjectForm,
        });

        /* Api */
        const updateServiceAccount = async () => {
            try {
                await SpaceConnector.client.identity.serviceAccount.update({
                    service_account_id: props.serviceAccountId,
                    project_id: state.projectForm.selectedProjectId,
                });
                showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_S_CHANGE_PROJECT'), '');
            } catch (e: unknown) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ALT_E_CHANGE_PROJECT'));
            }
        };

        /* Event */
        const handleClickEditButton = () => {
            state.mode = 'UPDATE';
        };
        const handleClickCancelButton = () => {
            state.mode = 'READ';
        };
        const handleChangeForm = (projectForm) => {
            state.projectForm = projectForm;
        };
        const handleClickSaveButton = async () => {
            if (!state.isFormValid) return;
            await updateServiceAccount();
            state.mode = 'READ';
            emit('change-project');
        };

        return {
            ...toRefs(state),
            ACCOUNT_TYPE,
            handleClickEditButton,
            handleClickCancelButton,
            handleClickSaveButton,
            handleChangeForm,
        };
    },
});
</script>

<style lang="postcss" scoped>
.service-account-project {
    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0 1rem 2.5rem 1rem;
        .service-account-project-form {
            /* custom project-select-dropdown */
            :deep(.project-select-dropdown) {
                width: 100%;
            }
        }
    }
}
</style>
