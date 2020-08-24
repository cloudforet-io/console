<template>
    <div class="collector-history-job">
        <div class="more-information-lap">
            <div>
                <span class="info-title">Collector Name: </span>
                <span class="info-text">{{ job.collector_info.name }}</span>
            </div>
            <div>
                <span class="info-title">Provider: </span>
                <span class="info-text">{{ job.collector_info.provider }}</span>
            </div>
            <!--            <span class="toggle-button">hide</span>-->
        </div>
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-query-search-table
                    :loading="loading"
                    :fields="fields"
                    :items="jobTasks"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
                    :style="{height: `${height}px`}"
                    :multi-select="false"
                    :select-index.sync="selectedIndexes"
                    :disabled-index="disabledIndex"
                    @change="getJobTasks"
                    @rowLeftClick="onSelect"
                >
                    <template #toolbox-top>
                        <div class="toolbox-filter-button-lap">
                            <div v-for="(status, idx) in statusList"
                                 :key="idx"
                                 class="filter-button-lap"
                            >
                                <span class="filter-button"
                                      :class="[activatedStatus === status.key ? 'active' : '', status.class]"
                                      @click="onClickStatus(status.key)"
                                >{{ status.label }}</span>
                            </div>
                        </div>
                    </template>
                    <template #col-service_account_id-format="{ value }">
                        {{ convertServiceAccountName(value) }}
                    </template>
                    <template #col-project_id-format="{ value }">
                        {{ convertProjectName(value) }}
                    </template>
                    <template #col-status-format="{ value }">
                        <span :class="value.toLowerCase()">{{ convertStatus(value) }}</span>
                    </template>
                    <template #col-created_at-format="{ value }">
                        {{ timestampFormatter(value) }}
                    </template>
                    <template #col-finished_at-format="{ value }">
                        아직 안함
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
        <div v-if="selectedItem && selectedItem.errors.length > 0">
            <p-panel-top :use-total-count="true" :total-count="selectedItem.errors.length">
                Error List
            </p-panel-top>
            <p-data-table :fields="errorFields"
                          :items="selectedItem.errors"
                          :sortable="false"
                          :selectable="false"
                          :loading="loading"
                          table-style-type="light"
                          bordered
            >
                <template #col-message-format="{ value }">
                    <div class="error-message">
                        {{ value }}
                    </div>
                </template>
            </p-data-table>
        </div>
    </div>
</template>

<script lang="ts">
import { capitalize, find } from 'lodash';

import { computed, reactive, toRefs } from '@vue/composition-api';

import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';

import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { timestampFormatter } from '@/lib/util';

export default {
    name: 'PCollectorHistoryDetail',
    components: {
        PDataTable,
        PPanelTop,
        PHorizontalLayout,
        PQuerySearchTable,
    },
    props: {
        job: {
            type: Object,
            required: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            jobTasks: [],
            serviceAccounts: [],
            projects: [],
            //
            disabledIndex: [0, 3],
            selectedIndexes: [],
            selectedItem: computed(() => state.jobTasks[state.selectedIndexes[0]]),
            //
            pageSize: 15,
            thisPage: 1,
            sortBy: '',
            sortDesc: true,
            totalCount: 0,
            //
            fields: [
                { label: 'Service Account', name: 'service_account_id' },
                { label: 'Project', name: 'project_id' },
                { label: 'Status', name: 'status' },
                { label: 'Created', name: 'created_count' },
                { label: 'Updated', name: 'updated_count' },
                { label: 'Error', name: 'errors.length' },
                { label: 'Start Time', name: 'created_at' },
                { label: 'Duration', name: 'finished_at' },
            ],
            errorFields: [
                { label: 'No.', name: 'sequence' },
                { label: 'Error Code', name: 'error_code' },
                { label: 'Error Message', name: 'message' },
                { label: 'Resource Type', name: 'resource_type' },
                { label: 'Resource ID', name: 'resource_id' },
            ],
            statusList: [
                { key: 'all', label: 'All', class: 'all' },
                { key: 'inProgress', label: 'In-progress', class: 'in-progress' },
                { key: 'success', label: 'Success', class: 'success' },
                { key: 'failure', label: 'Failure', class: 'failure' },
            ],
            activatedStatus: 'all',
        });

        const getJobTasks = async () => {
            try {
                const query = new QueryHelper();
                query.setSort(state.sortBy, state.sortDesc).setPage(((state.thisPage - 1) * state.pageSize) + 1, state.pageSize);

                const res = await SpaceConnector.client.inventory.jobTask.list({
                    query: query.data,
                    // eslint-disable-next-line camelcase
                    job_id: props.job.job_id,
                });
                state.jobTasks = res.results;
                state.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
            }
        };
        const getServiceAccounts = async () => {
            try {
                const res = await SpaceConnector.client.identity.serviceAccount.list();
                state.serviceAccounts = res.results;
            } catch (e) {
                console.error(e);
            }
        };
        const getProject = async () => {
            try {
                const res = await SpaceConnector.client.identity.project.list();
                state.projects = res.results;
            } catch (e) {
                console.error(e);
            }
        };

        const convertStatus = (status) => {
            if (status === 'PENDING' || status === 'IN_PROGRESS') return 'In Progress';
            return capitalize(status);
        };
        const convertServiceAccountName = (serviceAccountId) => {
            // eslint-disable-next-line camelcase
            const serviceAccount = find(state.serviceAccounts, { service_account_id: serviceAccountId });
            return serviceAccount?.name;
        };
        const convertProjectName = (projectId) => {
            // eslint-disable-next-line camelcase
            const project = find(state.projects, { project_id: projectId });
            return project?.name;
        };

        const onSelect = (item, index) => {
            state.selectedIndexes = index;
        };
        const onClickStatus = (status) => {
            state.activatedStatus = status;
        };

        const init = async () => {
            await getServiceAccounts();
            await getProject();
            await getJobTasks();
        };
        init();

        return {
            ...toRefs(state),
            timestampFormatter,
            getJobTasks,
            convertStatus,
            convertServiceAccountName,
            convertProjectName,
            onSelect,
            onClickStatus,
        };
    },
};
</script>

<style lang="postcss">
.collector-history-job {
    .more-information-lap {
        @apply bg-primary4 border border-gray-200;
        position: relative;
        border-left-width: 0.25rem;
        font-size: 0.75rem;
        line-height: 150%;
        border-radius: 0.125rem;
        box-sizing: border-box;
        margin-bottom: 1rem;
        padding: 1rem;
        .info-title {
            @apply text-gray-400;
            font-weight: bold;
        }
        .info-text {
            @apply text-gray-900;
        }
        .toggle-button {
            @apply text-secondary;
            position: absolute;
            right: 1rem;
            bottom: 0.5rem;
            cursor: pointer;
        }
    }

    .p-query-search-table {
        .p-data-table {
            .failure {
                @apply text-red-500;
            }
        }
    }

    .p-data-table {
        .error-message {
            display: block;
            max-width: 20rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>
