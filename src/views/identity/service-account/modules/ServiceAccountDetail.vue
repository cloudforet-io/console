<template>
    <div>
        <p-dynamic-layout type="list"
                          :options="schema.options"
                          :data="items"
        />
    </div>
</template>

<script lang="ts">
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import { useStore } from '@/store/toolset';
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

        const init = async () => {
            // watch(props.serviceAccountId, async (after, before) => {
            //     if (after !== before) {
            //         await getDetailSchema();
            //     }
            // }, { immediate: true });
            await getDetailSchema();
        };

        init();
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
