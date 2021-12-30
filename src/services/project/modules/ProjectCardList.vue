<template>
    <div class="project-card-list">
        <p-toolbox :searchable="false"
                   :page-size="pageSize"
                   :total-count="totalCount"
                   @change="onChange"
                   @refresh="getData()"
        />
        <p-data-loader class="flex-grow" :data="items" :loading="loading">
            <div class="project-cards">
                <div v-for="(item, i) in items" :key="i" class="project-card-container">
                    <router-link class="card"
                                 :to="{ name: PROJECT_ROUTE.DETAIL._NAME, params: { id: item.project_id }}"
                    >
                        <div class="card-top-wrapper">
                            <div class="group-name-wrapper">
                                <div class="group-name">
                                    <template v-if="parentGroups.length > 0">
                                        {{ parentGroups[parentGroups.length - 1].name }} >
                                    </template>
                                    {{ item.project_group_info.name }}
                                </div>
                                <div class="favorite-wrapper">
                                    <favorite-button :item-id="item.project_id"
                                                     favorite-type="project"
                                                     resource-type="identity.Project"
                                                     scale="0.7"
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
                                                         name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME,
                                                         query: { provider: getProvider(provider) ? provider : null },
                                                     }"
                                                     class="icon-link"
                                                     :style="{
                                                         backgroundImage: `url('${getProvider(provider).icon || require('@/assets/icons/ic_provider_other.svg')}')`
                                                     }"
                                        />
                                    </div>
                                    <router-link v-if="getDistinctProviders(item.providers).length !== 0" class="icon-wrapper" :to="{ name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME }">
                                        <p-i name="ic_plus_thin" scale="0.8" color="inherit" />
                                    </router-link>
                                </div>
                                <div v-if="getDistinctProviders(item.providers).length === 0" class="account-add">
                                    <router-link :to="{ name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME }">
                                        <p-i name="ic_plus_thin" scale="0.8" color="inherit" />
                                    </router-link>
                                    <router-link :to="{ name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME }">
                                        <span class="add-label"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <div class="card-bottom-wrapper">
                            <div class="project-summary">
                                <template v-if="cardSummaryLoading">
                                    <div v-for="v in skeletons" :key="v" class="skeleton-loading">
                                        <p-skeleton />
                                    </div>
                                </template>
                                <template v-else>
                                    <div v-for="{ title, summaryType } in projectSummaryList" :key="`summary-${title}-${item.project_id}`" class="project-summary-item">
                                        <div class="summary-item-text">
                                            {{ title }}
                                        </div>
                                        <router-link v-if="cardSummary[item.project_id]"
                                                     class="summary-item-num"
                                                     :to="getLocation(summaryType, INVENTORY_ROUTE.CLOUD_SERVICE._NAME, item.project_id)"
                                        >
                                            {{ getItemSummaryCount(summaryType, item.project_id) }}
                                        </router-link>
                                        <span v-else class="summary-item-num none">N/A</span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
            <template #no-data>
                <div v-if="(noProjectGroup || noProject)" class="empty-container">
                    <div v-if="noProjectGroup">
                        <p class="title">
                            {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_TITLE') }}<br>
                        </p>
                        <p class="content">
                            {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_CONTENT') }}
                        </p>
                        <p class="content-order">
                            <strong>1.</strong>&nbsp;{{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_CONTENT_ORDER_1') }}
                        </p>
                        <p class="content-order">
                            <strong>2.</strong>&nbsp;{{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_MSG_CONTENT_ORDER_2') }}
                        </p>
                        <p-icon-text-button style-type="primary-dark" class="mt-6" name="ic_plus_bold"
                                            width="1rem" height="1rem" @click="$emit('create-project-group')"
                        >
                            {{ $t('PROJECT.LANDING.EMPTY_PROJECT_GROUP_CREATE_BTN') }}
                        </p-icon-text-button>
                    </div>
                    <div v-else-if="noProject" class="empty-project">
                        <p class="text-primary2">
                            {{ $t('PROJECT.LANDING.EMPTY_PROJECT_MSG') }}
                        </p>
                    </div>
                </div>
            </template>
        </p-data-loader>

        <project-form-modal v-if="groupId && projectFormVisible"
                            :visible.sync="projectFormVisible"
                            :project-group-id="groupId"
                            @complete="listProjects(groupId, searchText)"
        />
    </div>
</template>


<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PSkeleton, PI, PIconTextButton, PToolbox, PDataLoader,
} from '@spaceone/design-system';
import { getAllPage } from '@spaceone/design-system/src/navigation/pagination/text-pagination/helper';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { range, uniq } from 'lodash';
import axios, { CancelTokenSource } from 'axios';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { store } from '@/store';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import ProjectFormModal from '@/services/project/project-detail/modules/ProjectFormModal.vue';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import { IDENTITY_ROUTE } from '@/services/identity/routes';
import { PROJECT_ROUTE } from '@/services/project/routes';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { i18n } from '@/translations';
import bytes from 'bytes';
import { SUMMARY_TYPE } from '@/services/project/type';
import { arrayToQueryString } from '@/lib/router-query-string';

interface CardSummary {
    [projectId: string]: {
        Compute: number;
        Database: number;
        Storage: number;
    };
}

export default {
    name: 'ProjectCardList',
    components: {
        ProjectFormModal,
        PIconTextButton,
        FavoriteButton,
        PI,
        PSkeleton,
        PToolbox,
        PDataLoader,
    },
    props: {
        parentGroups: {
            type: Array,
            default: () => [],
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: undefined,
            totalCount: 0,
            loading: true,
            cardSummaryLoading: true,
            pageStart: 1,
            pageSize: 24,
            allPage: computed(() => getAllPage(state.totalCount, (state.pageSize))),
            cardSummary: {} as CardSummary,
            // showAllProjects: false,
            noProject: computed(() => state.totalCount === 0),
            hoveredProjectId: '',
            hoveredGroupId: '',
            isAll: computed(() => !state.groupId),
            groupId: computed(() => store.getters['service/project/groupId']),
            searchText: computed(() => store.state.service.project.searchText),
            noProjectGroup: computed(() => !store.state.service.project.hasProjectGroup),
            projectFormVisible: computed({
                get() { return store.state.service.project.projectFormVisible; },
                set(val) { store.commit('service/project/setProjectFormVisible', val); },
            }),
            projectSummaryList: computed(() => [
                { title: i18n.t('PROJECT.LANDING.COMPUTE'), summaryType: SUMMARY_TYPE.COMPUTE },
                { title: i18n.t('PROJECT.LANDING.DATABASE'), summaryType: SUMMARY_TYPE.DATABASE },
                { title: i18n.t('PROJECT.LANDING.STORAGE'), summaryType: SUMMARY_TYPE.STORAGE },
            ]),
        });

        const byteFormatter = (num, option = {}) => bytes(num, { ...option, unitSeparator: ' ', decimalPlaces: 1 });
        const getItemSummaryCount = (summaryType, projectId) => {
            if (state.cardSummary) {
                let summaryCount = state.cardSummary[projectId][summaryType];
                if (summaryType === SUMMARY_TYPE.STORAGE) summaryCount = summaryCount ? byteFormatter(summaryCount) : 0;
                return summaryCount;
            }
            return {};
        };
        const getProvider = name => vm.$store.state.resource.provider.items[name] || {};
        const goToServiceAccount = (provider) => {
            vm.$router.push({
                name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME,
                query: { provider: getProvider(provider) ? provider : null },
            });
        };
        const getDistinctProviders = (items: string[]) => uniq(items);

        const listProjectApi = SpaceConnector.client.identity.projectGroup.listProjects;
        const listAllProjectApi = SpaceConnector.client.identity.project.list;
        const listQuery = new ApiQueryHelper();

        const getParams = (id?, text?) => {
            listQuery.setPageStart(state.pageStart)
                .setPageLimit(state.pageSize);

            if (text) {
                listQuery.setFilters([{ k: 'name', v: text, o: '' }]);
            } else {
                listQuery.setFilters([]);
            }

            const params: any = { include_provider: true, query: listQuery.data };
            if (id) params.project_group_id = id;
            // if (state.showAllProjects) params.recursive = true;

            return params;
        };


        let getCardToken: CancelTokenSource | undefined;
        const getCardSummary = async (items) => {
            if (items.length === 0) return;

            if (getCardToken) {
                getCardToken.cancel('Next request has been called.');
                getCardToken = undefined;
            }

            getCardToken = axios.CancelToken.source();
            const cardSummary: CardSummary = {};
            state.cardSummaryLoading = true;
            try {
                const ids = items?.map(item => item.project_id);
                const res = await SpaceConnector.client.statistics.topic.projectPage({
                    projects: ids,
                }, { cancelToken: getCardToken.token });
                res.results.forEach((d) => {
                    cardSummary[d.project_id] = {
                        Compute: d.compute_count || 0,
                        Database: d.database_count || 0,
                        Storage: d.storage_size || 0,
                    };
                });
                getCardToken = undefined;
                state.cardSummary = cardSummary;
                state.cardSummaryLoading = false;
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    state.cardSummary = cardSummary;
                    state.cardSummaryLoading = false;
                    ErrorHandler.handleError(e);
                }
            }
        };

        let listProjectToken: CancelTokenSource | undefined;
        const getData = async (_id?, _text?) => {
            const id = _id || state.groupId;
            const text = _text || state.searchText;

            // if request is already exist, cancel the request
            if (listProjectToken) {
                listProjectToken.cancel('Next request has been called.');
                listProjectToken = undefined;
            }
            // create a new token for upcoming request (overwrite the previous one)
            listProjectToken = axios.CancelToken.source();
            state.loading = true;
            try {
                let res;
                if (state.isAll) res = await listAllProjectApi(getParams(undefined, text), { cancelToken: listProjectToken.token });
                else res = await listProjectApi(getParams(id, text), { cancelToken: listProjectToken.token });
                state.items = res.results;
                state.totalCount = res.total_count;
                store.commit('service/project/setProjectCount', state.totalCount);
                state.loading = false;
                listProjectToken = undefined;
                await getCardSummary(res.results);
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    state.items = [];
                    state.totalCount = 0;
                    state.loading = false;
                    store.commit('service/project/setProjectCount', 0);
                    ErrorHandler.handleError(e);
                }
            }
        };

        const onChange = async (options: any) => {
            if (options.pageLimit !== undefined) {
                state.pageSize = options.pageLimit;
            }
            if (options.pageStart !== undefined) {
                state.pageStart = options.pageStart;
            }
            await getData();
        };

        const resetAll = () => {
            state.totalCount = 0;
            state.pageStart = 1;
            state.pageSize = 24;
        };

        const listProjects = async (groupId?, searchText?, reset = true) => {
            if (reset) resetAll();
            await getData(groupId, searchText);
        };

        const queryHelper = new QueryHelper();
        const getLocation = (serviceType: SUMMARY_TYPE, name, projectId) => ({
            name,
            query: {
                provider: 'all',
                service: arrayToQueryString([serviceType]),
                filters: queryHelper.setFilters([{ k: 'project_id', v: [projectId], o: '=' }]).rawQueryStrings[0],
            },
        });

        const createProject = async (item) => {
            try {
                await SpaceConnector.client.identity.project.create({
                    project_group_id: state.groupId,
                    ...item,
                });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '', vm.$root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
            } finally {
                state.projectFormVisible = false;
                await listProjects(state.groupId, state.searchText);
            }
        };


        /* Init */
        watch([() => store.state.service.project.isInitiated, () => state.groupId, () => state.searchText], async ([isInitiated, groupId, searchText]) => {
            if (isInitiated) await listProjects(groupId, searchText);
        }, { immediate: true });


        return {
            ...toRefs(state),
            INVENTORY_ROUTE,
            IDENTITY_ROUTE,
            PROJECT_ROUTE,
            getProvider,
            goToServiceAccount,
            getDistinctProviders,
            getData,
            onChange,
            skeletons: range(1),
            listProjects,
            getLocation,
            createProject,
            byteFormatter,
            getItemSummaryCount,
            SUMMARY_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-card-list {
    @apply flex flex-col h-full;
}
.show-all-wrapper {
    @apply flex h-full items-center text-base truncate leading-tight;
    .label {
        @apply text-sm ml-2 leading-relaxed;
    }
}

.empty-container {
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
    }
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
    .favorite-wrapper .favorite-btn::v-deep:not(.active) {
        display: none;
    }
    &:hover {
        .favorite-wrapper .favorite-btn::v-deep:not(.active) {
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
            @apply flex-grow border-gray-100 border-r mr-2;
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
        .skeleton-loading {
            @apply flex items-center pb-2 pr-15;
        }
    }
}
</style>
