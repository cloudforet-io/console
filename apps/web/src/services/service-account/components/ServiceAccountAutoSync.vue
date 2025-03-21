<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPaneLayout, PHeading, PLink, PHeadingLayout,
} from '@cloudforet/mirinae';


import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { TrustedAccountUpdateParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/update';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import AutoSyncState from '@/common/components/badge/auto-sync-state/AutoSyncState.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceAccountAutoSyncDetail from '@/services/service-account/components/ServiceAccountAutoSyncDetail.vue';
import ServiceAccountAutoSyncForm from '@/services/service-account/components/ServiceAccountAutoSyncForm.vue';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import type { PageMode } from '@/services/service-account/types/service-account-page-type';


const emit = defineEmits<{(e: 'refresh'): void; }>();
const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const serviceAccountPageFormState = serviceAccountPageStore.formState;

interface Props {
    editable: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    editable: false,
});

interface State {
    loading: boolean;
    isTrustedAccount: ComputedRef<boolean>;
    mode: PageMode;
    providerData: Partial<ProviderModel>;
}
const state = reactive<State>({
    loading: false,
    isTrustedAccount: computed(() => serviceAccountPageState.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    providerData: {},
    mode: 'READ',
});

/* Api */


/* Event */
const handleClickEditButton = () => {
    state.mode = 'UPDATE';
};
const handleClickCancelButton = () => {
    serviceAccountPageStore.initToOriginServiceAccountItem();
    state.mode = 'READ';
};
const handleClickSaveButton = async () => {
    if (!serviceAccountPageState.originServiceAccountItem.trusted_account_id) return;
    try {
        await SpaceConnector.clientV2.identity.trustedAccount.update<TrustedAccountUpdateParameters, TrustedAccountModel>({
            trusted_account_id: serviceAccountPageState.originServiceAccountItem.trusted_account_id,
            name: serviceAccountPageState.originServiceAccountItem.name,
            data: serviceAccountPageState.originServiceAccountItem.data,
            tags: serviceAccountPageState.originServiceAccountItem.tags,
            schedule: {
                state: serviceAccountPageFormState.isAutoSyncEnabled ? 'ENABLED' : 'DISABLED',
                hours: serviceAccountPageFormState.scheduleHours,
            },
            sync_options: {
                skip_project_group: serviceAccountPageFormState.skipProjectGroup,
                single_workspace_id: serviceAccountPageFormState.selectedSingleWorkspace ?? undefined,
            },
            plugin_options: serviceAccountPageFormState.additionalOptions,
        });
        showSuccessMessage(i18n.t('INVENTORY.SERVICE_ACCOUNT.DETAIL.UPDATE_SUCCESS'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    state.mode = 'READ';
    emit('refresh');
};

</script>

<template>
    <p-pane-layout class="service-account-auto-sync">
        <p-heading-layout>
            <template #heading>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.AUTO_SYNC_TITLE')"
                >
                    <template #title-right-extra>
                        <auto-sync-state v-if="state.mode==='READ'"
                                         :state="serviceAccountPageStore.getters.isOriginAutoSyncEnabled ? 'ENABLED' : 'DISABLED'"
                                         size="lg"
                                         class="ml-2"
                        />
                        <p-link v-else
                                :href="serviceAccountPageStore.getters.autoSyncDocsLink"
                                new-tab
                                highlight
                                action-icon="external-link"
                                class="ml-3"
                        >
                            Docs
                        </p-link>
                    </template>
                </p-heading>
            </template>
            <template #extra>
                <div class="h-full pt-8 px-4 pb-4">
                    <p-button v-if="state.mode === 'READ' && props.editable"
                              icon-left="ic_edit"
                              style-type="secondary"
                              @click="handleClickEditButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.EDIT') }}
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
        <div class="content-wrapper"
             :class="{'ml-4': state.mode === 'READ'}"
        >
            <service-account-auto-sync-detail v-if="state.mode === 'READ'" />
            <service-account-auto-sync-form v-if="state.mode === 'UPDATE'" />
            <div v-if="state.mode === 'UPDATE'"
                 class="button-wrapper"
            >
                <p-button style-type="tertiary"
                          class="mr-4"
                          @click="handleClickCancelButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CANCEL') }}
                </p-button>
                <p-button style-type="primary"
                          :loading="state.loading"
                          :disabled="!serviceAccountPageStore.formState.isAutoSyncFormValid"
                          @click="handleClickSaveButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.SAVE') }}
                </p-button>
            </div>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.service-account-auto-sync {
    grid-column: span 12 / span 12;

    .content-wrapper {
        padding-bottom: 2.5rem;

        .button-wrapper {
            margin: 2rem 0 0.75rem 1rem;
        }
    }
}
</style>
