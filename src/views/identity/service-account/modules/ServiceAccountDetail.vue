<template>
    <div>
        <p-dynamic-layout type="list"
                          :options="schema.options"
                          :data="items"
        />
    </div>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
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
            schema: [],
        });

        const getDetails = async () => {
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.get({
                    service_account_id: props.serviceAccountId,
                });
                state.items = res;
            } catch (e) {
                console.error(e);
                state.items = [];
            }
        };

        const getDetailSchema = async () => {
            const schema = await SpaceConnector.client.addOns.pageSchema.get({
                resource_type: 'identity.ServiceAccount',
                schema: 'details',
                options: {
                    provider: 'aws',
                },
            });
            state.schema = schema;
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
