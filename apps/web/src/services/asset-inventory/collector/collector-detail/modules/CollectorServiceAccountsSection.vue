<template>
    <p-pane-layout>
        <p-heading :title="i18n.t('INVENTORY.COLLECTOR.DETAIL.ATTACHED_SERVICE_ACCOUNTS')"
                   heading-type="sub"
        >
            <template #extra>
                <p-button size="md"
                          icon-left="ic_edit"
                          style-type="secondary"
                >
                    {{ i18n.t('INVENTORY.COLLECTOR.DETAIL.EDIT') }}
                </p-button>
            </template>
        </p-heading>
        <!-- TODO: bind other props of PToolboxTable -->
        <p-toolbox-table :fields="fields"
                         :items="state.secrets"
        />
    </p-pane-layout>
</template>

<script lang="ts" setup>
import {
    defineProps, reactive, watch, onMounted, computed,
} from 'vue';

import {
    PHeading, PButton, PPaneLayout, PToolboxTable,
} from '@spaceone/design-system';
import type { DefinitionField } from '@spaceone/design-system/types/data-display/tables/definition-table/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface SecretModel {
    secret_id: string;
    provider: string;
    service_account_id: string;
    project_id: string;
    created_at: string;
}
const props = defineProps<{
    providers: string[]|null
}>();

const fields: DefinitionField[] = [
    { name: 'service_account_id', label: 'Account Name' },
    { name: 'secret_id', label: 'Account ID' },
    { name: 'project_id', label: 'Project ID' },
    { name: 'provider', label: 'Provider' },
    { name: 'created_at', label: 'Created' },
];
const state = reactive({
    loading: true,
    secrets: null as null|SecretModel[],
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
});

const fetchSecrets = async (): Promise<SecretModel[]> => {
    try {
        // TODO: change to real data
        const results = await new Promise<SecretModel[]>((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        secret_id: 'secret-1',
                        provider: 'aws',
                        service_account_id: 'service-account-1',
                        project_id: 'project-1',
                        created_at: '2021-08-31T00:00:00Z',
                    },
                    {
                        secret_id: 'secret-2',
                        provider: 'azure',
                        service_account_id: 'service-account-2',
                        project_id: 'project-2',
                        created_at: '2021-08-31T00:00:00Z',
                    },
                ]);
            }, 2000);
        });
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const getSecrets = async (providers: string[]|null) => {
    state.loading = true;

    if (Array.isArray(providers)) {
        state.secrets = await fetchSecrets();
    } else {
        state.secrets = null;
    }

    state.loading = false;
};

watch(() => props.providers, async (providers) => {
    await getSecrets(providers);
}, { immediate: true });


onMounted(async () => {
    await store.dispatch('reference/serviceAccount/load');
});

</script>

<style lang="postcss" scoped>
.p-toolbox-table {
    border-color: transparent;
}
</style>
