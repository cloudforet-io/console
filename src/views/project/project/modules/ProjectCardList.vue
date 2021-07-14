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
                            <div class="group-name">
                                <template v-if="parentGroups.length > 0">
                                    {{ parentGroups[parentGroups.length - 1].name }} >
                                </template>
                                {{ item.project_group_info.name }}
                            </div>
                            <p class="project-name">
                                {{ item.name }}
                            </p>
                            <div class="project-summary">
                                <template v-if="cardSummaryLoading">
                                    <div v-for="v in skeletons" :key="v" class="skeleton-loading">
                                        <p-skeleton />
                                    </div>
                                </template>
                                <span v-else>
                                    <span class="summary-item-text">{{ $t('PROJECT.LANDING.SERVER') }}</span>
                                    <router-link v-if="cardSummary[item.project_id]"
                                                 class="summary-item-num"
                                                 :to="getLocation(item.project_id, INVENTORY_ROUTE.SERVER._NAME)"
                                    >{{ cardSummary[item.project_id].serverCount }}</router-link>
                                    <span v-else class="summary-item-num none">N/A</span>
                                    <span class="mx-2 text-gray-300 divider">|</span>
                                    <span class="summary-item-text">{{ $t('PROJECT.LANDING.CLOUD_SERVICES') }}</span>
                                    <router-link v-if="cardSummary[item.project_id]"
                                                 class="summary-item-num"
                                                 :to="getLocation(item.project_id, INVENTORY_ROUTE.CLOUD_SERVICE._NAME)"
                                    >{{ cardSummary[item.project_id].cloudServiceCount }}
                                    </router-link>
                                    <span v-else class="summary-item-num none">N/A</span>
                                </span>
                            </div>
                        </div>

                        <div class="card-bottom-wrapper">
                            <div class="accounts">
                                <span v-if="getDistinctProviders(item.providers).length" class="label">{{ $t('PROJECT.LANDING.SERVICE_ACCOUNTS') }}</span>
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
                                </div>
                                <div class="account-add">
                                    <router-link class="icon-wrapper" :to="{ name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME }">
                                        <p-i name="ic_plus_thin" scale="0.8" color="inherit" />
                                    </router-link>
                                    <router-link :to="{ name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME }">
                                        <span v-if="getDistinctProviders(item.providers).length === 0" class="add-label"> {{ $t('PROJECT.LANDING.ADD_SERVICE_ACCOUNT') }}</span>
                                    </router-link>
                                </div>
                            </div>
                            <div class="favorite-wrapper">
                                <favorite-button :item-id="item.project_id"
                                                 favorite-type="project"
                                                 resource-type="identity.Project"
                                />
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
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import ProjectFormModal from '@/views/project/project/modules/ProjectFormModal.vue';
import { INVENTORY_ROUTE } from '@/routes/inventory/inventory-route';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';
import { PROJECT_ROUTE } from '@/routes/project/project-route';
import router from '@/routes';


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
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            items: undefined,
            totalCount: 0,
            loading: true,
            cardSummaryLoading: true,
            pageStart: 1,
            pageSize: 24,
            allPage: computed(() => getAllPage(state.totalCount, (state.pageSize))),
            cardSummary: {},
            // showAllProjects: false,
            noProject: computed(() => state.totalCount === 0),
            hoveredProjectId: '',
            hoveredGroupId: '',
            isAll: computed(() => !state.groupId),
            groupId: computed(() => store.getters['projectPage/groupId']),
            searchText: computed(() => store.state.projectPage.searchText),
            noProjectGroup: computed(() => !store.state.projectPage.hasProjectGroup),
            projectFormVisible: computed({
                get() { return store.state.projectPage.projectFormVisible; },
                set(val) { store.commit('projectPage/setProjectFormVisible', val); },
            }),
        });

        const getProvider = name => vm.$store.state.resource.provider.items[name] || {};
        const goToServiceAccount = (provider) => {
            router.push({
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
            const cardSummary = {};
            state.cardSummaryLoading = true;
            try {
                const ids = items?.map(item => item.project_id);
                const res = await SpaceConnector.client.statistics.topic.projectPage({
                    projects: ids,
                }, { cancelToken: getCardToken.token });

                res.results.forEach((d) => {
                    cardSummary[d.project_id] = {
                        ...d,
                        cloudServiceCount: d.cloud_service_count || 0,
                        serverCount: d.server_count || 0,
                    };
                });
                getCardToken = undefined;
                state.cardSummary = cardSummary;
                state.cardSummaryLoading = false;
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    state.cardSummary = cardSummary;
                    state.cardSummaryLoading = false;
                    console.error(e);
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
                store.commit('projectPage/setProjectCount', state.totalCount);
                state.loading = false;
                listProjectToken = undefined;
                await getCardSummary(res.results);
            } catch (e) {
                if (!axios.isCancel(e.axiosError)) {
                    state.items = [];
                    state.totalCount = 0;
                    state.loading = false;
                    store.commit('projectPage/setProjectCount', 0);
                    console.error(e);
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
        const getLocation = (projectId, name) => ({
            name,
            query: { filters: queryHelper.setFilters([{ k: 'project_id', v: projectId, o: '=' }]).rawQueryStrings },
        });

        const createProject = async (item) => {
            try {
                await SpaceConnector.client.identity.project.create({
                    project_group_id: state.groupId,
                    ...item,
                });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'), e, vm.$root);
            } finally {
                state.projectFormVisible = false;
                await listProjects(state.groupId, state.searchText);
            }
        };


        /* Init */
        watch([() => store.state.projectPage.isInitiated, () => state.groupId, () => state.searchText], async ([isInitiated, groupId, searchText]) => {
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
        @apply bg-white border border-gray-200 overflow-visible rounded cursor-pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        &:hover {
            @apply border-l border-gray-200 bg-blue-100;
        }
    }
}

.card {
    @apply flex flex-col w-full h-full;
    .favorite-wrapper .favorite-btn::v-deep:not(.active) {
        display: none;
    }
    &:hover {
        .favorite-wrapper .favorite-btn::v-deep:not(.active) {
            display: block;
        }
    }
}
.favorite-wrapper {
    @apply flex-shrink-0 h-full inline-flex items-center justify-center;
    width: 3rem;
}

.card-top-wrapper {
    @apply flex-grow mx-4 my-6 flex flex-col;
    .group-name {
        @apply flex-shrink-0 text-gray-500 text-xs truncate;
        margin-bottom: 0.25rem;
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
    }
    .project-summary {
        @apply flex-shrink-0;
        .summary-item-text {
            @apply text-sm text-left inline-block;
        }
        .summary-item-num {
            @apply ml-2 font-bold;
            &:hover:not(.none) {
                @apply text-secondary;
                text-decoration: underline;
                cursor: pointer;
            }
            &.none {
                @apply text-gray-300;
            }
        }
        .skeleton-loading {
            @apply flex items-center pb-2 pr-15;
        }
    }
}
.card-bottom-wrapper {
    @apply flex-shrink-0 flex-grow-0 flex items-center justify-between border-t border-gray-100 text-xs text-gray-500;
    height: 3rem;
    .accounts {
        @apply flex-grow-0 overflow-x-hidden flex items-center justify-between pl-4;
        .label {
            @apply flex-shrink-0 flex-grow-0 mr-2;
        }
        .provider-icon-wrapper {
            @apply flex-shrink inline-flex items-center truncate;
            .provider {
                @apply truncate;
                min-width: 0;
                height: 1.25rem;
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
            @apply flex-shrink-0 inline-flex items-center text-gray-900;
            .add-label {
                @apply ml-2;
                line-height: 1.2;
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
                .add-label {
                    text-decoration: underline;
                }
            }
        }
    }

}
</style>
