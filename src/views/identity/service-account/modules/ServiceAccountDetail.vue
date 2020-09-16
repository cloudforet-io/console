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
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'ServiceAccountDetail',
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

        const getDetails = async () => {
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.get({
                    // eslint-disable-next-line camelcase
                    service_account_id: props.serviceAccountId,
                });
                state.items = res;
            } catch (e) {
                console.error(e);
                state.items = [];
            }
        };

        const getDetailSchema = async () => {
            const res = await SpaceConnector.client.addOns.pageSchema.get({
                // eslint-disable-next-line camelcase
                resource_type: 'identity.ServiceAccount',
                schema: 'details',
                options: {
                    provider: 'aws',
                },
            });
            state.schema = res.details[0];
            await getDetails();
        };

        watch(() => props.serviceAccountId, async (after, before) => {
            if (after !== before) {
                await getDetailSchema();
                await getDetails();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
