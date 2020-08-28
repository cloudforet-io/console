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
            <template #data-state="{data: value}">
                <p-status v-bind="LIFE_CYCLE[value]" />
            </template>
            <template #data-server_type="{data: value}">
                <p-badge v-bind="SERVER_TYPE[value]">
                    {{ value }}
                </p-badge>
            </template>
            <template #data-project_id="{data: value}">
                <p-anchor :href="referenceRouter('identity.Project', value)"
                          target="_blank"
                >
                    {{ projects[value] }}
                </p-anchor>
            </template>
            <template #data-provider="{data: value}">
                <p-badge v-if="providers[value] && providers[value].name"
                         :background-color="providers[value] ? providers[value].color : null"
                >
                    {{ providers[value].name }}
                </p-badge>
            </template>
            <template #data-collection_info.service_accounts="{data: value}">
                <p-text-list :items="value" delimiter=" ">
                    <template #default="{value: d}">
                        <p-badge v-if="serviceAccounts[d]"
                                 :link="referenceRouter('identity.ServiceAccount', d)"
                                 target="_blank"
                                 outline background-color="violet.500"
                        >
                            {{ serviceAccounts[d] }}
                        </p-badge>
                    </template>
                </p-text-list>
            </template>
            <template #data-collection_info.secrets="{data: value}">
                <p-text-list :items="value" delimiter=" ">
                    <template #default="{value: d}">
                        <p-badge v-if="secrets[d]"
                                 outline background-color="violet.500"
                        >
                            {{ secrets[d] }}
                        </p-badge>
                    </template>
                </p-text-list>
            </template>
            <template #data-collection_info.collectors="{data: value}">
                <p-text-list :items="value" delimiter=" ">
                    <template #default="{value: d}">
                        <p-badge v-if="collectors[d]"
                                 :link="referenceRouter('inventory.Collector', d)"
                                 target="_blank"
                                 outline background-color="violet.500"
                        >
                            {{ collectors[d] }}
                        </p-badge>
                    </template>
                </p-text-list>
            </template>
            <template #data-created_at="{data: value}">
                {{ timestampFormatter(value) }}
            </template>
            <template #data-updated_at="{data: value}">
                {{ timestampFormatter(value) }}
            </template>
            <template #data-deleted_at="{data: value}">
                {{ timestampFormatter(value) }}
            </template>
        </p-definition-table>

        <p-panel-top>Operation System</p-panel-top>
        <p-definition-table :fields="osFields"
                            :data="osData"
                            :loading="loading"
        />
        <p-panel-top>Hardware</p-panel-top>
        <p-definition-table :fields="hardwareFields"
                            :data="hardwareData"
                            :loading="loading"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { get, debounce } from 'lodash';
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
import { SpaceConnector } from '@/lib/space-connector';

export default {
    name: 'ServerBaseInfo',
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
    setup(props) {
        const {
            project, provider, serviceAccount, secret, collector,
        } = useStore();


        const state = reactive({
            baseInfoFields: [
                { name: 'server_id', label: 'ID' },
                { name: 'name', label: 'Name' },
                { name: 'primary_ip_address', label: 'Primary IP' },
                { name: 'collection_info.state', label: 'Collection State', formatter: data => COLLECTION_STATE[data] },
                { name: 'state', label: 'Life Cycle', formatter: data => LIFE_CYCLE[data] },
                { name: 'reference.resource_id', label: 'Resource ID' },
                { name: 'os_type', label: 'OS Type' },
                { name: 'server_type', label: 'Server Type', formatter: data => SERVER_TYPE[data] },
                { name: 'project_id', label: 'Project', formatter: data => state.projects[data] },
                { name: 'provider', label: 'Provider', formatter: data => state.providers[data] },
                { name: 'collection_info.service_accounts', label: 'Service Accounts', formatter: data => state.serviceAccounts[data] },
                { name: 'collection_info.secrets', label: 'Secrets', formatter: data => state.secrets[data] },
                { name: 'collection_info.collectors', label: 'Collected By', formatter: data => state.collectors[data] },
                { name: 'created_at', label: 'Created', formatter: timestampFormatter },
                { name: 'updated_at', label: 'Updated', formatter: timestampFormatter },
                { name: 'deleted_at', label: 'Deleted', formatter: timestampFormatter },
            ] as DefinitionField[],
            osFields: [
                { name: 'os_distro', label: 'OS Distribution' },
                { name: 'os_arch', label: 'OS Architecture' },
                { name: 'os_details', label: 'OS Version Details' },
                { name: 'os_license', label: 'OS License' },
            ] as DefinitionField[],
            hardwareFields: [
                { name: 'core', label: 'Core' },
                { name: 'memory', label: 'Memory' },
                { name: 'serial_number', label: 'Serial Number' },
                { name: 'manufacturer', label: 'Manufacturer' },
                { name: 'model', label: 'Server Model' },
                { name: 'cpu_model', label: 'CPU Model' },
                { name: 'cpu_arch', label: 'CPU Architecture' },
                { name: 'cpu_socket', label: 'CPU Socket' },
                { name: 'core_per_socket', label: 'Core per Socket' },
                { name: 'memory_count', label: 'Memory Count' },
                { name: 'hyper_threading', label: 'Hyper-threading' },
                { name: 'bios_version', label: 'Bios Version' },
                { name: 'bios_released_at', label: 'Bios Released' },
            ] as DefinitionField[],
            customBaseInfoFields: ['collection_info.state', 'state', 'server_type',
                'project_id', 'provider', 'collection_info.service_accounts',
                'collection_info.secrets', 'collection_info.collectors',
                'created_at', 'updated_at', 'deleted_at'],

            // data
            osData: computed(() => get(props.data, 'data.os', {})),
            hardwareData: computed(() => get(props.data, 'data.hardware', {})),

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

<style lang="postcss" scoped>

</style>
