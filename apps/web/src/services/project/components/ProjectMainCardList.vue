<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSkeleton, PI, PToolbox, PDataLoader, PEmpty,
} from '@spaceone/design-system';
import { uniq } from 'lodash';

import { getAllPage } from '@cloudforet/core-lib/component-util/pagination';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { byteFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/model';
import type { ProjectListRequestParams } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { arrayToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant.js';
import ProjectFormModal from '@/services/project/components/ProjectFormModal.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import type { ProjectGroupTreeNodeData } from '@/services/project/types/project-tree-type';


interface CardSummary {
    [projectId: string]: {
        Server: number;
        Database: number;
        Storage: number;
    };
}
const SUMMARY_TYPE = {
    SERVER: 'Server',
    DATABASE: 'Database',
    STORAGE: 'Storage',
} as const;
type SummaryType = typeof SUMMARY_TYPE[keyof typeof SUMMARY_TYPE];

interface Props {
    parentGroups: ProjectGroupTreeNodeData[];
    manageDisabled: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    parentGroups: () => [],
    manageDisabled: false,
});

const projectPageStore = useProjectPageStore();
const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    items: [] as ProjectModel[],
    totalCount: 0,
    loading: true,
    cardSummaryLoading: true,
    pageStart: 1,
    pageSize: 24,
    searchText: undefined as string|undefined,
    allPage: computed(() => getAllPage(state.totalCount, (state.pageSize))),
    cardSummary: {} as CardSummary,
    noProject: computed(() => state.totalCount === 0),
    hoveredProjectId: '',
    hoveredGroupId: '',
    groupId: computed(() => projectPageStore.groupId),
    noProjectGroup: computed(() => !projectPageStore.hasProjectGroup),
    projectFormVisible: computed({
        get() { return projectPageStore.projectFormVisible; },
        set(val) { projectPageStore.$patch({ projectFormVisible: val }); },
    }),
    projectSummaryList: computed(() => [
        { title: i18n.t('PROJECT.LANDING.SERVER'), summaryType: SUMMARY_TYPE.SERVER },
        { title: i18n.t('PROJECT.LANDING.DATABASE'), summaryType: SUMMARY_TYPE.DATABASE },
        { title: i18n.t('PROJECT.LANDING.STORAGE'), summaryType: SUMMARY_TYPE.STORAGE },
    ]),
    shouldUpdateProjectList: computed<boolean>(() => projectPageStore.shouldUpdateProjectList),
});

const getItemSummaryCount = (summaryType: SummaryType, projectId: string) => {
    if (state.cardSummary) {
        let summaryCount = state.cardSummary[projectId][summaryType];
        if (summaryType === SUMMARY_TYPE.STORAGE) summaryCount = summaryCount ? byteFormatter(summaryCount) : 0;
        return summaryCount;
    }
    return {};
};
const getProvider = (name: string) => storeState.providers[name] || {};
const getDistinctProviders = (items: string[]) => uniq(items);
const getProjectGroupName = (projectItem: ProjectModel, parentGroups?: ProjectGroupTreeNodeData[]) => {
    let result = '';
    if (parentGroups?.length) {
        result = `${parentGroups[parentGroups.length - 1].name} > `;
    }
    result += storeState.projectGroups[projectItem.project_group_id]?.name || '';
    return result;
};

const getCardSummary = async () => {
    if (state.items.length === 0) return;

    const cardSummary: CardSummary = {};
    state.cardSummaryLoading = true;
    try {
        // HACK: get cloud service summary
        // const ids = state.items?.map((item) => item.project_id);
        // const res = await SpaceConnector.client.statistics.topic.projectPage({
        //     projects: ids,
        // });
        // res.results.forEach((d) => {
        //     cardSummary[d.project_id] = {
        //         Server: d.server_count || 0,
        //         Database: d.database_count || 0,
        //         Storage: d.storage_size || 0,
        //     };
        // });
        // state.cardSummary = cardSummary;
    } catch (e: any) {
        state.cardSummary = cardSummary;
        ErrorHandler.handleError(e);
    } finally {
        state.cardSummaryLoading = false;
    }
};

const listProjectFetcher = getCancellableFetcher(SpaceConnector.clientV2.identity.project.list<ProjectListRequestParams, ListResponse<ProjectModel>>);
const listApiQueryHelper = new ApiQueryHelper();
const fetchProjectList = async (projectGroupId?: string) => {
    const _projectGroupId = projectGroupId || state.groupId;

    listApiQueryHelper.setPageStart(state.pageStart).setPageLimit(state.pageSize);
    listApiQueryHelper.setFilters([]);
    if (state.searchText !== undefined) {
        listApiQueryHelper.setFilters([{ v: state.searchText }]);
    }

    try {
        state.loading = true;
        const { status, response } = await listProjectFetcher({
            query: listApiQueryHelper.data,
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
            project_group_id: _projectGroupId,
        });
        if (status === 'succeed') {
            state.items = response.results || [];
            state.totalCount = response.total_count || 0;
            projectPageStore.$patch({ projectCount: state.totalCount });
            state.loading = false;
            await getCardSummary();
        }
    } catch (e: any) {
        state.items = [];
        state.totalCount = 0;
        state.loading = false;
        projectPageStore.$patch({ projectCount: 0 });
        ErrorHandler.handleError(e);
    }
};

const handleChange = async (options: any) => {
    state.searchText = options.searchText;
    if (options.pageLimit !== undefined) {
        state.pageSize = options.pageLimit;
    }
    if (options.pageStart !== undefined) {
        state.pageStart = options.pageStart;
    }
    await fetchProjectList();
};

const resetAll = () => {
    state.totalCount = 0;
    state.pageStart = 1;
    state.pageSize = 24;
};

const listProjects = async (groupId?: string, reset = true) => {
    if (reset) resetAll();
    await fetchProjectList(groupId);
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
        await fetchProjectList();
        projectPageStore.$patch({ shouldUpdateProjectList: false });
    }
});

/* Init */
watch([() => projectPageStore.isInitiated, () => state.groupId], async ([isInitiated, groupId]) => {
    if (isInitiated) await listProjects(groupId);
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
                   :total-count="state.totalCount"
                   @change="handleChange"
                   @refresh="fetchProjectList()"
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
                                        <router-link v-for="(provider, index) in getDistinctProviders(item.providers)"
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
                                    <router-link v-if="getDistinctProviders(item.providers).length !== 0"
                                                 class="icon-wrapper"
                                                 :to="{ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME }"
                                    >
                                        <p-i name="ic_plus_thin"
                                             scale="0.8"
                                             color="inherit"
                                        />
                                    </router-link>
                                </div>
                                <div v-if="getDistinctProviders(item.providers).length === 0"
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
                                    <p-skeleton v-if="state.cardSummaryLoading" />
                                    <router-link v-else-if="state.cardSummary[item.project_id]"
                                                 class="summary-item-num"
                                                 :to="getLocation(summaryType, ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME, item.project_id)"
                                    >
                                        {{ getItemSummaryCount(summaryType, item.project_id) }}
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
            <p-empty
                v-if="state.noProjectGroup || state.noProject"
                show-image
            >
                <div class="description-content">
                    <p>{{ state.noProjectGroup ? $t('PROJECT.LANDING.NO_PROJECT_GROUP_MSG') : $t('PROJECT.LANDING.EMPTY_PROJECT_MSG') }}</p>
                </div>
            </p-empty>
            <template #no-data />
        </p-data-loader>

        <project-form-modal
            v-if="state.projectFormVisible"
            :visible.sync="state.projectFormVisible"
            :project-group-id="state.groupId"
            @complete="listProjects(state.groupId)"
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
