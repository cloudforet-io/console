<template>
    <div>
        <p-dynamic-layout v-if="schema"
                          v-bind="schema"
                          :data="items"
        />
    </div>
</template>

<script lang="ts">

import { reactive, toRefs, watch } from '@vue/composition-api';
import { PDynamicLayout } from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'ServiceAccountDetails',
    components: {
        PDynamicLayout,
    },
    props: {
        selectedProvider: {
            type: String,
            default: '',
        },
        serviceAccountId: {
            type: String,
            default: '',
            required: true,
        },
    },
    setup(props) {
        const state = reactive({
            items: [],
            schema: null as null | object,
        });

        const getDetails = async (accountId) => {
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.get({
                    // eslint-disable-next-line camelcase
                    service_account_id: accountId,
                });
                state.items = res;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
            }
        };

        const getDetailSchema = async (provider) => {
            const accountId = props.serviceAccountId;
            const res = await SpaceConnector.client.addOns.pageSchema.get({
                // eslint-disable-next-line camelcase
                resource_type: 'identity.ServiceAccount',
                schema: 'details',
                options: {
                    provider,
                },
            });
            state.schema = res.details[0];
            await getDetails(accountId);
        };

        watch(() => props.serviceAccountId, async (after) => {
            if (after) {
                await getDetailSchema(props.selectedProvider);
            } else {
                state.items = [];
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>
