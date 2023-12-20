<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSkeleton, PI, PToolbox, PDataLoader, PEmpty,
} from '@spaceone/design-system';
import { uniq } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProviderReferenceMap, ProviderReferenceItem } from '@/store/modules/reference/provider/type';

import { arrayToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant.js';
import ProjectFormModal from '@/services/project/components/ProjectFormModal.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import type { ProjectGroupTreeNodeData } from '@/services/project/types/project-tree-type';


const SUMMARY_TYPE = {
    SERVER: 'Server',
    DATABASE: 'Database',
    STORAGE: 'Storage',
} as const;
type SummaryType = typeof SUMMARY_TYPE[keyof typeof SUMMARY_TYPE];

interface Props {
    parentGroups: ProjectGroupTreeNodeData[];
}
const props = withDefaults(defineProps<Props>(), {
    parentGroups: () => [],
});

const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const projectPageGetters = projectPageStore.getters;
const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    items: [] as ProjectModel[],
    loading: true,
    cardSummaryLoading: {
        Server: true,
        Database: true,
        Storage: true,
    } as Record<SummaryType, boolean>,
    pageStart: 1,
    pageSize: 24,
    searchText: undefined as string|undefined,
    cloudServiceDataMap: {} as Record<SummaryType, any>,
    serviceAccountList: [] as ServiceAccountModel[],
    groupId: computed(() => projectPageGetters.groupId),
    noProject: computed(() => projectPageState.projectCount === 0),
    noProjectGroup: computed(() => !projectPageState.hasProjectGroup),
    projectSummaryList: computed(() => [
        { title: i18n.t('PROJECT.LANDING.SERVER'), summaryType: SUMMARY_TYPE.SERVER },
        { title: i18n.t('PROJECT.LANDING.DATABASE'), summaryType: SUMMARY_TYPE.DATABASE },
        { title: i18n.t('PROJECT.LANDING.STORAGE'), summaryType: SUMMARY_TYPE.STORAGE },
    ]),
    shouldUpdateProjectList: computed<boolean>(() => projectPageState.shouldUpdateProjectList),
});

/* Util */
const getProvider = (name: string): ProviderReferenceItem => storeState.providers[name] || {};
const getDistinctProviders = (projectId: string): string[] => uniq(state.serviceAccountList.filter((d) => d.project_id === projectId).map((d) => d.provider));
const getCloudServiceCount = (summaryType: SummaryType, projectId: string) => {
    const cloudServiceData = state.cloudServiceDataMap[summaryType].find((d) => d.project_id === projectId);
    return cloudServiceData?.total_count || 0;
};
const getProjectGroupName = (projectItem: ProjectModel, parentGroups?: ProjectGroupTreeNodeData[]) => {
    let result = '';
    if (parentGroups?.length) {
        result = `${parentGroups[parentGroups.length - 1].name} > `;
    }
    result += storeState.projectGroups[projectItem.project_group_id]?.name || '';
    return result;
};
const fetchAll = async () => {
    await fetchProjectList();
    const projectIdList = state.items.map((item) => item.project_id);
    await Promise.allSettled([
        Object.values(SUMMARY_TYPE).map((summaryType) => analyzeCloudService(summaryType, projectIdList)),
        fetchServiceAccountList(projectIdList),
    ]);
};

/* Api */
const listProjectFetcher = getCancellableFetcher<ListResponse<ProjectModel>>(SpaceConnector.clientV2.identity.project.list);
const listProjectApiQueryHelper = new ApiQueryHelper();
const fetchProjectList = async () => {
    listProjectApiQueryHelper.setPageStart(state.pageStart).setPageLimit(state.pageSize);
    listProjectApiQueryHelper.setFilters([]);
    if (state.searchText !== undefined) {
        listProjectApiQueryHelper.setFilters([{ v: state.searchText }]);
    }
    if (!projectPageState.isWorkspaceOwner) {
        listProjectApiQueryHelper.setOrFilters([
            { k: 'project_type', v: 'PUBLIC', o: '=' },
            { k: 'created_by', v: store.state.user.userId, o: '=' },
            { k: 'users', v: [store.state.user.userId], o: '=' },
        ]);
    }

    try {
        state.loading = true;
        const params: ProjectListParameters = {
            query: listProjectApiQueryHelper.data,
            project_group_id: state.groupId,
        };
        const { status, response } = await listProjectFetcher(params);
        if (status === 'succeed') {
            state.items = response.results || [];
            projectPageStore.setProjectCount(response.total_count);
            state.loading = false;
        }
    } catch (e: any) {
        state.items = [];
        state.loading = false;
        projectPageStore.setProjectCount(0);
        ErrorHandler.handleError(e);
    }
};
const analyzeCloudServiceApiQueryHelper = new ApiQueryHelper();
const analyzeCloudService = async (summaryType: SummaryType, projectIdList: string[]) => {
    analyzeCloudServiceApiQueryHelper.setFilters([
        { k: 'ref_cloud_service_type.labels', v: summaryType, o: '=' },
        { k: 'ref_cloud_service_type.is_major', v: true, o: '=' },
        { k: 'project_id', v: projectIdList, o: '' },
    ]);
    try {
        const res = await SpaceConnector.clientV2.inventory.cloudService.analyze({
            query: {
                group_by: ['project_id'],
                fields: {
                    total_count: {
                        operator: 'count',
                    },
                    total_size: {
                        key: 'instance_size',
                        operator: 'sum',
                    },
                },
                ...analyzeCloudServiceApiQueryHelper.data,
            },
        });
        state.cloudServiceDataMap[summaryType] = res.results || [];
    } catch (e: any) {
        ErrorHandler.handleError(e);
        state.cloudServiceDataMap[summaryType] = [];
    } finally {
        state.cardSummaryLoading[summaryType] = false;
    }
};
const listServiceAccountApiQueryHelper = new ApiQueryHelper();
const fetchServiceAccountList = async (projectIdList: string[]) => {
    listServiceAccountApiQueryHelper
        .setFilters([{ k: 'project_id', v: projectIdList, o: '' }])
        .setOnly('provider', 'project_id', 'service_account_id');
    try {
        const res = await SpaceConnector.clientV2.identity.serviceAccount.list({
            query: {
                ...listServiceAccountApiQueryHelper.data,
            },
        });
        state.serviceAccountList = res.results || [];
    } catch (e: any) {
        ErrorHandler.handleError(e);
        state.serviceAccountList = [];
    }
};

/* Event */
const handleChange = async (options?: any) => {
    if (options?.searchText !== undefined) {
        state.searchText = options.searchText;
    }
    if (options?.pageLimit !== undefined) {
        state.pageSize = options.pageLimit;
    }
    if (options?.pageStart !== undefined) {
        state.pageStart = options.pageStart;
    }
    await fetchAll();
};

const handleConfirmProjectForm = async () => {
    projectPageStore.setProjectCount(0);
    state.pageStart = 1;
    state.pageSize = 24;
    await fetchAll();
};

const queryHelper = new QueryHelper();
const getLocation = (serviceType: SummaryType, name: string, projectId: string) => ({
    name,
    query: {
        provider: 'all',
        service: arrayToQueryString([serviceType]),
        filters: queryHelper.setFilters([{ k: 'project_id', v: [projectId], o: '=' }]).rawQueryStrings[0],
    },
});

// When ProjectGroupTreeNodeData has been updated | project has been created
watch(() => state.shouldUpdateProjectList, async () => {
    if (state.shouldUpdateProjectList) {
        await fetchAll();
        projectPageStore.setShouldUpdateProjectList(false);
    }
});

/* Init */
watch([() => projectPageState.isInitiated, () => state.groupId], async ([isInitiated]) => {
    if (isInitiated) await handleConfirmProjectForm();
}, { immediate: true });

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/provider/load'),
    ]);
})();
</script>

<template>
    <div class="project-main-card-list">
        <p-toolbox :page-size="state.pageSize"
                   :total-count="projectPageState.projectCount"
                   @change="handleChange"
                   @refresh="handleChange()"
        />
        <p-data-loader class="flex-grow"
                       :data="state.items"
                       :loading="state.loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <div class="project-cards">
                <div v-for="(item, i) in state.items"
                     :key="i"
                     class="project-card-container"
                >
                    <router-link class="card"
                                 :to="{ name: PROJECT_ROUTE.DETAIL._NAME, params: { id: item.project_id }}"
                    >
                        <div class="card-top-wrapper">
                            <div class="group-name-wrapper">
                                <div class="group-name">
                                    {{ getProjectGroupName(item, props.parentGroups) }}
                                </div>
                                <div class="favorite-wrapper">
                                    <favorite-button :item-id="item.project_id"
                                                     :favorite-type="FAVORITE_TYPE.PROJECT"
                                                     scale="0.7"
                                                     class="favorite-button"
                                    />
                                </div>
                            </div>
                            <p class="project-name">
                                {{ item.name }}
                            </p>
                            <div class="accounts">
                                <div class="provider-icon-wrapper">
                                    <div class="provider">
                                        <router-link v-for="(provider, index) in getDistinctProviders(item.project_id)"
                                                     :key="index"
                                                     :to="{
                                                         name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
                                                         query: { provider: getProvider(provider) ? provider : null },
                                                     }"
                                                     class="icon-link"
                                                     :style="{
                                                         backgroundImage: `url('${getProvider(provider).icon || require('@/assets/images/ic_cloud-filled.svg')}')`
                                                     }"
                                        />
                                    </div>
                                    <router-link v-if="getDistinctProviders(item.project_id).length !== 0"
                                                 class="icon-wrapper"
                                                 :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }"
                                    >
                                        <p-i name="ic_plus_thin"
                                             scale="0.8"
                                             color="inherit"
                                        />
                                    </router-link>
                                </div>
                                <div v-if="getDistinctProviders(item.project_id).length === 0"
                                     class="account-add"
                                >
                                    <router-link :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }">
                                        <p-i name="ic_plus_thin"
                                             scale="0.8"
                                             color="inherit"
                                        />
                                    </router-link>
                                    <router-link :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }">
                                        <span class="add-label"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <div class="card-bottom-wrapper">
                            <div class="project-summary">
                                <div v-for="{ title, summaryType } in state.projectSummaryList"
                                     :key="`summary-${title}-${item.project_id}`"
                                     class="project-summary-item"
                                >
                                    <div class="summary-item-text">
                                        {{ title }}
                                    </div>
                                    <p-skeleton v-if="state.cardSummaryLoading[summaryType]" />
                                    <router-link v-else-if="getCloudServiceCount(summaryType, item.project_id) !== 0"
                                                 class="summary-item-num"
                                                 :to="getLocation(summaryType, ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME, item.project_id)"
                                    >
                                        {{ getCloudServiceCount(summaryType, item.project_id) }}
                                    </router-link>
                                    <span v-else
                                          class="summary-item-num none"
                                    >N/A</span>
                                </div>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
            <template #no-data>
                <p-empty show-image>
                    <div class="description-content">
                        <p>{{ state.noProjectGroup ? $t('PROJECT.LANDING.NO_PROJECT_GROUP_MSG') : $t('PROJECT.LANDING.EMPTY_PROJECT_MSG') }}</p>
                    </div>
                </p-empty>
            </template>
        </p-data-loader>
        <project-form-modal
            v-if="projectPageState.projectFormModalVisible"
            :visible="projectPageState.projectFormModalVisible"
            :project-group-id="state.groupId"
            @confirm="handleConfirmProjectForm()"
            @update:visible="projectPageStore.setProjectFormModalVisible"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-main-card-list {
    @apply flex flex-col h-full;
}

.project-cards {
    @apply grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(18.75rem, 1fr));
    grid-auto-rows: 11.25rem;
    .project-card-container {
        @apply bg-white border border-gray-200 overflow-visible rounded-lg cursor-pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        &:hover {
            @apply border-l border-gray-200 bg-blue-100;
        }
    }
}

.description-content {
    width: 20rem;

    @apply text-primary-2;
}

.favorite-wrapper {
    @apply flex-shrink-0 inline-flex items-center justify-center;
    position: absolute;
    right: 1.20625rem;
    top: 1.20625rem;
    width: 0.875rem;
}

.card {
    @apply flex flex-col w-full h-full;
    position: relative;
    .favorite-wrapper .favorite-button:not(.active) {
        display: none;
    }
    &:hover {
        .favorite-wrapper .favorite-button:not(.active) {
            display: block;
        }
    }
}

.card-top-wrapper {
    @apply flex-grow flex flex-col;
    margin: 1rem 1rem 0.5rem 1rem;
    .group-name-wrapper {
        @apply flex justify-between items-center;
        .group-name {
            @apply flex-shrink-0 text-gray-500 text-xs truncate;
            line-height: 1.5;
            width: calc(100% - 1rem);
        }
    }
    .accounts {
        @apply flex-grow-0 overflow-x-hidden flex;
        .provider-icon-wrapper {
            @apply flex-shrink inline-flex items-center truncate;
            .provider {
                @apply truncate;
                min-width: 0;
                height: 1.25rem;
            }
            .icon-wrapper {
                @apply bg-gray-100 rounded-full inline-flex justify-center items-center;
                height: 1.25rem;
                width: 1.25rem;
            }
            &:hover {
                @apply text-secondary font-bold;
                .icon-wrapper {
                    @apply bg-blue-300;
                }
            }
            .icon-link {
                @apply flex-shrink-0 inline-block mr-2;
                height: 1.25rem;
                width: 1.25rem;
                background-repeat: no-repeat;
                background-size: 100%;
                background-position: center;
                line-height: 1.25rem;
                &:hover {
                    opacity: 50%;
                }
            }
        }
        .account-add {
            @apply flex-shrink-0 inline-flex text-gray-900;
            .add-label {
                @apply text-xs;
                line-height: 1.2;
            }
            &:hover {
                .add-label {
                    text-decoration: underline;
                }
            }
        }
    }
    .project-name {
        @apply flex-grow flex-shrink-0 font-bold overflow-hidden;
        display: -webkit-box;
        text-overflow: ellipsis;
        word-wrap: break-word;
        font-size: 1.125rem;
        line-height: 1.2;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        max-width: 90%;
        max-height: 2.6875rem;
        margin-bottom: 0.25rem;
    }
}
.card-bottom-wrapper {
    @apply flex-shrink-0 flex-grow-0 flex items-center justify-between border-t border-gray-100 text-xs text-gray-700;
    .project-summary {
        @apply flex-shrink-0 flex w-full;
        padding: 0.75rem 1rem;
        .project-summary-item {
            @apply flex-grow border-gray-100 border-r mr-2 pr-2;
            .summary-item-text {
                @apply text-left;
                font-size: 0.625rem;
                line-height: 1rem;
            }
            .summary-item-num {
                @apply text-xs text-gray-900;
                line-height: 1.125rem;
                &:hover:not(.none) {
                    @apply text-secondary;
                    text-decoration: underline;
                    cursor: pointer;
                }
                &.none {
                    @apply text-gray-300;
                }
            }
            &:last-child {
                @apply border-0;
            }
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    @apply flex-col text-center justify-start;
    .title {
        @apply mb-4 text-primary-dark;
        margin-top: 5rem;
        font-size: 1.5rem;
        font-weight: bold;
        line-height: 1.2;
    }
    .content {
        @apply mb-4 text-gray-600;
        font-size: 0.875rem;
        line-height: 1.5;
    }
    .content-order {
        @apply text-gray-dark;
        font-size: 0.875rem;
        line-height: 1.5;
    }
    .empty-project {
        @apply text-gray-300 text-center text-base;
        img {
            margin: 0 auto 0.5rem;
        }
    }
}
</style>
