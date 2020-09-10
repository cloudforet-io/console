<template>
    <div>
        <p-panel-top>Base Information</p-panel-top>
        <p-definition-table :fields="baseInfoFields"
                            :data="data"
                            :loading="loading"
        >
            <template #data-collection_info.state="{data: value}">
                <p-status v-bind="COLLECTION_STATE[value]" />
            </template>
            <template #data-project_id="{data: value}">
                <p-anchor :href="referenceRouter('identity.Project', value)"
                          target="_blank"
                >
                    {{ projects[value] || value }}
                </p-anchor>
            </template>
            <template #data-provider="{data: value}">
                <p-badge v-if="providers[value] && providers[value].name || value"
                         :background-color="providers[value] ? providers[value].color : null"
                >
                    {{ providers[value] ? providers[value].name || value : value }}
                </p-badge>
            </template>
            <template #data-collection_info.service_accounts="{data: value}">
                <p-text-list :items="value" delimiter=" ">
                    <template #default="{value: d}">
                        <p-badge v-if="d"
                                 :link="referenceRouter('identity.ServiceAccount', d)"
                                 target="_blank"
                                 outline background-color="violet.500"
                        >
                            {{ serviceAccounts[d] || d }}
                        </p-badge>
                    </template>
                </p-text-list>
            </template>
            <template #data-collection_info.secrets="{data: value}">
                <p-text-list :items="value" delimiter=" ">
                    <template #default="{value: d}">
                        <p-badge v-if="d"
                                 outline background-color="violet.500"
                        >
                            {{ secrets[d] || d }}
                        </p-badge>
                    </template>
                </p-text-list>
            </template>
            <template #data-collection_info.collectors="{data: value}">
                <p-text-list :items="value" delimiter=" ">
                    <template #default="{value: d}">
                        <p-badge v-if="d"
                                 :link="referenceRouter('inventory.Collector', d)"
                                 target="_blank"
                                 outline background-color="violet.500"
                        >
                            {{ collectors[d] || d }}
                        </p-badge>
                    </template>
                </p-text-list>
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import { DefinitionField } from '@/components/organisms/tables/definition-table/type';
import { COLLECTION_STATE, LIFE_CYCLE, SERVER_TYPE } from '@/views/inventory/server/enums';
import PStatus from '@/components/molecules/status/PStatus.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { ProviderInfo, useStore } from '@/store/toolset';
import PTextList from '@/components/molecules/lists/text-list/PTextList.vue';
import { timestampFormatter } from '@/lib/util';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';

export default {
    name: 'CloudServiceBaseInfo',
    components: {
        PAnchor,
        PTextList,
        PBadge,
        PStatus,
        PDefinitionTable,
        PPanelTop,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        loading: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        const {
            project, provider, serviceAccount, secret, collector,
        } = useStore();

        const state = reactive({
            baseInfoFields: [
                { name: 'cloud_service_id', label: 'ID' },
                { name: 'provider', label: 'Provider' },
                { name: 'cloud_service_group', label: 'Cloud Service Group' },
                { name: 'cloud_service_type', label: 'Cloud Service Type' },
                { name: 'collection_info.state', label: 'Collection State' },
                { name: 'reference.resource_id', label: 'Resource ID' },
                { name: 'project_id', label: 'Project' },
                { name: 'collection_info.service_accounts', label: 'Service Accounts' },
                { name: 'collection_info.secrets', label: 'Secrets' },
                { name: 'collection_info.collectors', label: 'Collected By' },
                { name: 'created_at', label: 'Created', formatter: timestampFormatter },
                { name: 'updated_at', label: 'Updated', formatter: timestampFormatter },
            ] as DefinitionField[],
            // formatters
            projects: computed(() => project.state.projects || {}),
            providers: computed<ProviderInfo>(() => provider.state.providers || {}),
            serviceAccounts: computed(() => serviceAccount.state.serviceAccounts || {}),
            secrets: computed(() => secret.state.secrets || {}),
            collectors: computed(() => collector.state.collectors || {}),
        });

        return {
            ...toRefs(state),
            COLLECTION_STATE,
            LIFE_CYCLE,
            SERVER_TYPE,
            timestampFormatter,
            referenceRouter,
        };
    },
};
</script>
