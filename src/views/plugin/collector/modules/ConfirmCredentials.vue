<template>
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
                {{ secretCount[item.name] || 0 }}
            </div>
            <div v-else>
                {{ secretCount[item.name] || 0 }}
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
</template>

<script lang="ts">
import { makeTrItems } from '@/lib/view-helper';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import { FILTER_OPERATOR, fluentApi } from '@/lib/fluent-api';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { STAT_OPERATORS } from '@/lib/fluent-api/statistics/type';

interface Value {
    name: string;
    count: number;
}

export default {
    name: 'ConfirmCredentials',
    components: {
        PDataTable,
        PI,
    },
    props: {
        provider: {
            type: String,
            default: '',
        },
        supportedSchema: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, context) {
        const state: any = reactive({
            supportedSchemaSet: computed(() => new Set(props.supportedSchema)),
            schemaItems: [] as any[],
            loading: true,
            secretCount: {},
            fields: computed(() => makeTrItems([
                ['name', 'COMMON.CREDENTIALS'],
                ['count', 'COMMON.COUNT'],
                ['supported', 'FIELD.SUPPORTED'],
            ], context.parent)),
        });


        const providerApi = fluentApi.identity().provider();
        const statApi = fluentApi.statisticsTest().resource().stat<Value>()
            .addGroupKey('schema', 'name')
            .addGroupField('count', STAT_OPERATORS.count)
            .setResourceType('secret.Secret');


        const getProviderSchemaList = async () => {
            try {
                const res = await providerApi.get().setId(props.provider).execute();
                // all schema list that supported by provider
                state.schemaItems = res.data.capability.supported_schema.map(name => ({ name }));
            } catch (e) {
                console.error(e);
            }
        };

        const listSecretCount = async () => {
            try {
                const res = await statApi.setFilter({
                    key: 'provider',
                    value: props.provider,
                    operator: FILTER_OPERATOR.in,
                }).execute();
                state.secretCount = {};
                res.data.results.forEach((d) => {
                    state.secretCount[d.name] = d.count;
                });
            } catch (e) {
                console.error(e);
            }
        };

        watch(() => props.provider, async (val) => {
            if (val) {
                state.loading = true;
                await Promise.all([listSecretCount(), getProviderSchemaList()]);
                state.loading = false;
            }
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
