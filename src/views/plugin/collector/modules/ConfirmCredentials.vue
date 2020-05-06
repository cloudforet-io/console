<template>
    <div>
        <p-data-table
            :items="schemaItems"
            :fields="fields"
            :sortable="false"
            :selectable="false"
            :loading="loading"
        >
            <template #col-count-format="{item}">
                <div v-if="supportedSchemaSet.has(item.name)"
                     class="text-safe font-bold"
                >
                    {{ countData[item.name] }}
                </div>
                <div v-else>
                    {{ countData[item.name] }}
                </div>
            </template>
            <template #col-supported-format="{item}">
                <div v-if="supportedSchemaSet.has(item.name)">
                    <p-i name="ic_state_active"
                         width="1.5rem"
                         height="1.5rem"
                    />
                </div>
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import { makeTrItems } from '@/lib/view-helper';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import { fluentApi } from '@/lib/fluent-api';
import {
    computed, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'ConfirmCredentials',
    components: {
        PDataTable,
        PI,
    },
    props: {
        provider: String,
    },
    setup(props, context) {
        const state = reactive({
            supportedSchemaSet: new Set(),
            schemaItems: [] as any[],
            loading: true,
            countData: {
                // eslint-disable-next-line camelcase
                aws_access_key: 32,
            },
            fields: computed(() => makeTrItems([
                ['name', 'COMMON.CREDENTIALS'],
                ['count', 'COMMON.COUNT'],
                ['supported', 'FIELD.SUPPORTED'],
            ], context.parent)),
        });


        const providerApi = fluentApi.identity().provider();
        const secretApi = fluentApi.secret().secret();

        const listCredentials = async () => {
            try {
                const res = await secretApi.list().setProvider(props.provider).execute();
                state.supportedSchemaSet = new Set(res.data.results.map(item => item.schema));
            } catch (e) {
                console.error(e);
            }
        };

        const getProviderSchemaList = async () => {
            try {
                const res = await providerApi.get().setId(props.provider).execute();
                state.schemaItems = res.data.capability.supported_schema.map(name => ({ name }));
            } catch (e) {
                console.error(e);
            }
        };

        watch(() => props.provider, async (val) => {
            if (val) {
                state.loading = true;
                await listCredentials();
                await getProviderSchemaList();
                state.loading = false;
            }
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style scoped>

</style>
