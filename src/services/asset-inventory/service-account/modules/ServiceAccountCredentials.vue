<template>
    <p-pane-layout class="service-account-credentials">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS')">
            <template #extra>
                <p-button v-if="mode === 'READ'" icon="ic_edit" @click="handleClickEditButton">
                    <!--song-lang-->
                    Edit
                </p-button>
                <div v-else class="button-wrapper">
                    <p-button style-type="transparent" @click="handleClickCancelButton">
                        <!--song-lang-->
                        Cancel
                    </p-button>
                    <p-button style-type="primary-dark"
                              :disabled="!isFormValid"
                              @click="handleClickSaveButton"
                    >
                        <!--song-lang-->
                        Save
                    </p-button>
                </div>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <service-account-credentials-detail v-show="mode === 'READ'"
                                                :service-account-id="serviceAccountId"
                                                :credential-data="credentialData"
                                                :provider="provider"
            />
            <template v-if="mode === 'UPDATE'">
                <service-account-credentials-form edit-mode="UPDATE"
                                                  :provider="provider"
                                                  :is-valid.sync="isFormValid"
                                                  :origin-form-data="credentialForm"
                                                  @change="handleChangeCredentialForm"
                />
            </template>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PPaneLayout, PPanelTop, PButton,
} from '@spaceone/design-system';
import {
    defineComponent, reactive, toRefs, watch,
} from 'vue';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountCredentialsDetail
    from '@/services/asset-inventory/service-account/modules/ServiceAccountCredentialsDetail.vue';
import ServiceAccountCredentialsForm
    from '@/services/asset-inventory/service-account/modules/ServiceAccountCredentialsForm.vue';
import type { PageMode, CredentialForm } from '@/services/asset-inventory/service-account/type';
import { EDIT_MODE } from '@/services/asset-inventory/service-account/type';


interface Props {
    provider?: string;
    serviceAccountId?: string;
}

interface CredentialModel {
    schema?: string;
    provider?: string;
    secret_type?: string;
    [key: string]: string | undefined;
}

export default defineComponent<Props>({
    name: 'ServiceAccountCredentials',
    components: {
        ServiceAccountCredentialsForm,
        ServiceAccountCredentialsDetail,
        PPaneLayout,
        PPanelTop,
        PButton,
    },
    props: {
        provider: {
            type: String,
            default: undefined,
        },
        serviceAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            mode: 'READ' as PageMode,
            isFormValid: undefined,
            credentialData: {} as CredentialModel,
            credentialForm: {} as CredentialForm,
        });

        /* Api */
        const apiQuery = new ApiQueryHelper();
        const getCredentialData = async (serviceAccountId: string) => {
            try {
                state.loading = true;

                const getQuery = () => apiQuery
                    .setFilters([{ k: 'service_account_id', v: serviceAccountId, o: '=' }]);
                const { results } = await SpaceConnector.client.secret.secret.list({ query: getQuery().data });
                if (results.length) {
                    state.credentialData = results[0];
                    state.credentialForm.selectedSecretType = results[0].schema;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.credentialData = {};
            } finally {
                state.loading = false;
            }
        };

        /* Event */
        const handleClickEditButton = () => {
            state.mode = 'UPDATE';
        };
        const handleClickCancelButton = () => {
            state.mode = 'READ';
        };
        const handleClickSaveButton = () => {
            if (!state.isFormValid) return;
            state.mode = 'READ';
            console.log('save!');
        };
        const handleChangeCredentialForm = (credentialForm) => {
            state.credentialForm = credentialForm;
        };

        /* Watcher */
        watch(() => props.serviceAccountId, (serviceAccountId) => {
            if (serviceAccountId) getCredentialData(serviceAccountId);
        }, { immediate: true });

        return {
            ...toRefs(state),
            EDIT_MODE,
            handleClickEditButton,
            handleClickCancelButton,
            handleClickSaveButton,
            handleChangeCredentialForm,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-credentials {
    .p-panel-top::v-deep {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
    }
}
</style>
