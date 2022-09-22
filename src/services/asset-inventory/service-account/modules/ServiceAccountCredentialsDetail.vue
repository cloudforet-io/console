<template>
    <div class="service-account-credentials-detail">
        <p-dynamic-layout v-if="detailSchema"
                          v-bind="detailSchema"
                          :data="convertedCredentialData"
                          :field-handler="fieldHandler"
        />
    </div>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PDynamicLayout,
} from '@spaceone/design-system';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import type { ItemOptions } from '@/component-util/dynamic-layout/layout-schema';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CredentialModel } from '@/services/asset-inventory/service-account/type';


interface Props {
    credentialData: CredentialModel;
}

export default defineComponent<Props>({
    name: 'ServiceAccountCredentialsDetail',
    components: {
        PDynamicLayout,
    },
    props: {
        credentialData: {
            type: Object as PropType<CredentialModel>,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            credentialJsonSchema: {},
            convertedCredentialData: computed(() => {
                const convertedData = { ...props.credentialData };
                Object.keys(state.credentialJsonSchema?.properties ?? {}).forEach((k) => {
                    convertedData[k] = '••••••••••••••••••••';
                });
                return convertedData;
            }),
            detailSchema: computed(() => {
                const fields = Object.entries(state.credentialJsonSchema?.properties ?? {}).map(([k, v]) => ({
                    key: k,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    name: v?.title ?? k,
                    options: { disable_copy: true },
                }));
                return {
                    name: 'Credentials',
                    type: 'item',
                    options: {
                        fields: [
                            { key: 'schema', name: 'Secret Type', options: { disable_copy: true } },
                            ...fields,
                        ],
                        translation_id: 'IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS',
                    } as ItemOptions,
                };
            }),
        });

        /* Util */
        const fieldHandler = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /* Api */
        const getCredentialSchema = async (selectedSecretType) => {
            try {
                const res = await SpaceConnector.client.repository.schema.get({
                    name: selectedSecretType,
                    only: ['schema'],
                });
                state.credentialJsonSchema = res.schema;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.credentialJsonSchema = {};
            }
        };

        /* Watcher */
        watch(() => props.credentialData, (credentialData) => {
            if (credentialData?.schema) {
                getCredentialSchema(credentialData.schema);
            } else {
                state.credentialJsonSchema = {};
            }
        });

        return {
            ...toRefs(state),
            fieldHandler,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-credentials-detail {
    /* custom design-system component - p-panel-top */
    :deep(.p-panel-top) {
        display: none;
    }

    /* custom design-system component - p-definition-table */
    :deep(.p-definition-table) {
        min-height: auto;
    }
}
</style>
