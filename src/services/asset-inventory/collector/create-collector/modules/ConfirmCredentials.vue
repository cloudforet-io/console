<template>
    <p-data-table :items="schemaItems"
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
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PDataTable, PI } from '@spaceone/design-system';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

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
    setup(props) {
        const state: any = reactive({
            supportedSchemaSet: computed(() => new Set(props.supportedSchema)),
            schemaItems: [] as any[],
            loading: true,
            secretCount: {},
            fields: [
                { name: 'name', label: 'Credentials' },
                { name: 'count', label: 'Count' },
                { name: 'supported', label: 'Availability' },
            ],
        });

        const getProviderSchemaList = async () => {
            try {
                const res = await SpaceConnector.client.identity.provider.get({
                    provider: props.provider,
                });
                state.schemaItems = res.capability.supported_schema.map(name => ({ name }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.schemaItems = [];
            }
        };

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setFilters([{
                k: 'provider',
                v: props.provider,
                o: '=',
            }]);
            return apiQuery.data;
        };

        const listSecretCount = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.secretCount({
                    query: getQuery(),
                });
                state.secretCount = {};
                res.results.forEach((d) => {
                    state.secretCount[d.name] = d.count;
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        watch(() => props.provider, async (val) => {
            if (val) {
                state.loading = true;
                await Promise.all([listSecretCount(), getProviderSchemaList()]);
                state.loading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>
