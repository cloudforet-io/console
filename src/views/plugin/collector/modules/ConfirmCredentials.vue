<template>
    <div>
        <p-data-table
            :items="schema"
            :fields="fields"
            :sortable="false"
            :selectable="false"
            :loading="!(isLoadCount&&isLoadSchema)"
        >
            <template #col-count-format="{item}">
                <div v-if="supportSchema.has(item.name)"
                     :style="{color: colors.support,'font-weight':'bold'}"
                >
                    {{ countData[item.name] }}
                </div>
                <div v-else>
                    {{ countData[item.name] }}
                </div>
            </template>
            <template #col-supported-format="{item}">
                <div v-if="supportSchema.has(item.name)">
                    <!--                    {{ supportSchema.has(item.name) }}-->
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
import { reactive, toRefs } from '@vue/composition-api';
import {
    safe,
} from '@/styles/colors';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'ConfirmCredentials',
    components: {
        PDataTable,
        PI,
    },
    props: {
        items: Array,
        provider: String,
    },
    setup(props, context) {
        const state = reactive({
            supportSchema: new Set(props.items),
            schema: [] as any[],
            isLoadSchema: false,
            isLoadCount: true,
            countData: {
                // eslint-disable-next-line camelcase
                aws_access_key: 32,
            },
            supportedData: {
                // eslint-disable-next-line camelcase
                aws_access_key: 'no',
            },
            colors: {
                support: safe,
            },
        });

        const fields = makeTrItems([
            ['name', 'COMMON.CREDENTIALS'],
            ['count', 'COMMON.COUNT'],
            ['supported', 'FIELD.SUPPORTED'],
        ], context.parent);

        const getProviderSchemaList = async () => {
            await fluentApi.identity().provider().get().setId(props.provider)
                .execute()
                .then((res) => {
                    state.schema = res.data.capability.supported_schema.map(name => ({ name }));
                    state.isLoadSchema = true;
                })
                .catch((e) => {
                    console.error(e);
                });
        };

        getProviderSchemaList();

        return {
            ...toRefs(state),
            fields,
            getProviderSchemaList,
        };
    },
};
</script>

<style scoped>

</style>
