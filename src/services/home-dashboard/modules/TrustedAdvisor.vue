<template>
    <widget-layout>
        <template #title>
            <div class="title">
                <span :style="{ 'color': providers.aws ? providers.aws.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.TITLE') }}</span>
            </div>
        </template>
        <p-data-loader
            :loading="false"
            :data="projectSummaryData"
        >
            <div class="content-wrapper">
                <trusted-advisor-overall :extra-params="extraParams" />
                <div class="project-summary-wrapper">
                    <div class="title">
                        <span class="text">{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.SUB_TITLE_PROJECT_SUMMARY') }}</span>
                        <p-text-pagination
                            :this-page.sync="thisPage"
                            :all-page="allPage"
                            @pageChange="changePageNumber"
                        />
                    </div>
                    <div class="table-wrapper">
                        <div v-for="rowNum of range(-1, 5)"
                             :key="rowNum"
                             class="table-row"
                             :class="{ 'project-name-row': rowNum === -1 }"
                        >
                            <div class="left-part">
                                <div v-if="rowNum > -1"
                                     class="label-wrapper"
                                >
                                    <p-i :name="tableData[rowNum].icon"
                                         width="0.875rem"
                                         height="0.875rem"
                                         color="inherit transparent"
                                    />
                                    <span class="text hidden lg:inline-block">{{ tableData[rowNum].label }}</span>
                                </div>
                            </div>
                            <div class="right-part grid grid-cols-12 gap-1">
                                <div v-for="colNum of range(1, 7)"
                                     :key="colNum"
                                     class="col-wrapper col-span-2"
                                >
                                    <template v-if="rowNum === -1">
                                        <span v-if="projectSummaryData[colNum * thisPage - 1]"
                                              v-tooltip.top="projectSummaryData[colNum * thisPage - 1].tooltipText"
                                              class="project-name"
                                        >
                                            <p-i v-if="projectSummaryData[colNum * thisPage - 1].isFavorite"
                                                 name="ic_bookmark"
                                                 class="favorite-icon"
                                                 width="0.625rem"
                                                 height="0.625rem"
                                            />
                                            <span>{{ projectSummaryData[colNum * thisPage - 1].projectName }}</span>
                                        </span>
                                    </template>
                                    <template v-else>
                                        <router-link v-if="getProjectBoxCount(rowNum, colNum * thisPage - 1) > 0"
                                                     :to="projectSummaryLinkFormatter(rowNum, colNum * thisPage - 1)"
                                        >
                                            <div class="box"
                                                 :class="getProjectBoxStatus(rowNum, colNum * thisPage - 1)"
                                            >
                                                <span class="box-text">{{ getProjectBoxCount(rowNum, colNum * thisPage - 1) }}</span>
                                            </div>
                                        </router-link>
                                        <div v-else
                                             class="box empty"
                                        >
                                            <span class="box-text">0</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #no-data>
                <p-empty
                    show-image
                    :title="$t('COMMON.WIDGETS.TRUSTED_ADVISOR.NO_DATA')"
                >
                    <template #image>
                        <img alt="illust_planet"
                             src="@/assets/images/illust_planet.svg"
                        >
                    </template>
                    {{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.NO_DATA_DESC') }}
                </p-empty>
            </template>
        </p-data-loader>
    </widget-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PTextPagination, PI, PEmpty, PDataLoader,
} from '@spaceone/design-system';
import {
    find, forEach, range, size,
} from 'lodash';

import { getAllPage } from '@cloudforet/core-lib/component-util/pagination';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import TrustedAdvisorOverall from '@/services/home-dashboard/modules/trusted-advisor/TrustedAdvisorOverall.vue';

enum STATUS {
    error = 'error',
    warning = 'warning',
    ok = 'ok',
}
enum CATEGORY {
    cost_optimizing,
    performance,
    security,
    fault_tolerance,
    service_limits,
}

interface ProjectSummaryData {
    projectId: string;
    projectName: string;
    tooltipText: string;
    counts: [STATUS, number][];
    isFavorite: boolean;
}

const CLOUD_SERVICE_GROUP = 'TrustedAdvisor';
const CLOUD_SERVICE_NAME = 'Check';

export default {
    name: 'TrustedAdvisor',
    components: {
        TrustedAdvisorOverall,
        PTextPagination,
        WidgetLayout,
        PI,
        PEmpty,
        PDataLoader,
    },
    props: {
        extraParams: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();
        const state = reactive({
            loading: true,
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            favoriteProjects: computed<FavoriteItem[]>(() => store.state.favorite.projectItems),
            thisPage: 1,
            allPage: 1,
            tableData: computed(() => ([
                {
                    label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_COST_OPTIMIZATION'),
                    icon: 'ic_cost_optimization',
                },
                {
                    label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_PERFORMANCE'),
                    icon: 'ic_performance',
                },
                {
                    label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SECURITY'),
                    icon: 'ic_security',
                },
                {
                    label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_FAULT_TOLERANCE'),
                    icon: 'ic_fault_tolerance',
                },
                {
                    label: i18n.t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SERVICE_LIMITS'),
                    icon: 'ic_service_limits',
                },
            ])),
            projectSummaryData: [] as ProjectSummaryData[],
        });

        /* util */
        const changePageNumber = (page) => {
            state.thisPage = page;
        };
        const getProjectBoxStatus = (rowNum, colNum) => {
            const projectData = state.projectSummaryData[colNum];
            if (projectData) {
                const type = projectData.counts[rowNum][0];
                const count = projectData.counts[rowNum][1];
                if (count === 0) return 'empty';
                return type;
            }
            return 'empty';
        };
        const getProjectBoxCount = (rowNum, colNum) => (state.projectSummaryData[colNum] ? state.projectSummaryData[colNum].counts[rowNum][1] : 0);
        const projectSummaryLinkFormatter = (rowNum, colNum) => {
            const status = getProjectBoxStatus(rowNum, colNum);
            const category = CATEGORY[rowNum];
            const projectId = state.projectSummaryData[colNum]?.projectId;

            const filters: ConsoleFilter[] = [];
            filters.push({ k: 'data.status', o: '=', v: status });
            if (category) filters.push({ k: 'data.category', o: '=', v: category });
            if (projectId) filters.push({ k: 'project_id', o: '=', v: projectId });

            return {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                query: {
                    filters: queryHelper.setFilters(filters).rawQueryStrings,
                },
                params: {
                    provider: 'aws',
                    group: CLOUD_SERVICE_GROUP,
                    name: CLOUD_SERVICE_NAME,
                },
            };
        };

        /* api */
        const getProjectSummary = async (projects: ProjectReferenceMap) => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.statistics.topic.trustedAdvisorByProject(props.extraParams);
                state.allPage = getAllPage(size(res), 6);

                const projectSummaryData: ProjectSummaryData[] = [];
                forEach(res, (projectData, projectId) => {
                    const counts: [STATUS, number][] = Array(5).fill([STATUS.error, 0]);
                    forEach(projectData, (countData, category) => {
                        let count = 0;
                        let type = STATUS.error;
                        if (countData.error_count > 0) {
                            count = countData.error_count;
                        } else if (countData.warning_count > 0) {
                            count = countData.warning_count;
                            type = STATUS.warning;
                        } else if (countData.ok_count > 0) {
                            count = countData.ok_count;
                            type = STATUS.ok;
                        }
                        counts.splice(CATEGORY[category], 1, [type, count]);
                    });
                    projectSummaryData.push({
                        projectId,
                        projectName: projects[projectId]?.name,
                        tooltipText: projects[projectId]?.label,
                        counts,
                        isFavorite: !!find(state.favoriteProjects, { itemId: projectId }),
                    });
                });
                state.projectSummaryData = projectSummaryData.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.projectSummaryData = [];
            } finally {
                state.loading = false;
            }
        };

        const asyncInit = async () => {
            await Promise.allSettled([
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
                // LOAD REFERENCE STORE
                store.dispatch('reference/project/load'),
                store.dispatch('reference/provider/load'),
            ]);
        };
        asyncInit();

        watch(() => store.state.reference.project.items, (projects) => {
            if (projects) getProjectSummary(projects);
        }, { immediate: true });

        return {
            ...toRefs(state),
            changePageNumber,
            range,
            getProjectBoxStatus,
            getProjectBoxCount,
            projectSummaryLinkFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    @apply font-bold text-label-xl;
    line-height: 1.2;
}
.content-wrapper {
    @apply grid grid-cols-12 gap-6;
    margin-top: 0.625rem;
    .title {
        position: relative;
        display: flex;
        height: 2rem;
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.2;
        .text {
            margin: auto 0;
        }
        .text-pagination {
            position: absolute;
            right: 0;
            font-weight: normal;
        }
    }
    .project-summary-wrapper {
        @apply col-span-9;

        @screen mobile {
            @apply col-span-12;
        }
    }
    .table-wrapper {
        padding-top: 0.5rem;
        .table-row {
            display: flex;
            width: 100%;
            padding: 2px 0;
            &.project-name-row {
                height: 5.5rem;
            }

            .left-part {
                width: 20%;

                @screen tablet {
                    width: 4%;
                }

                @screen mobile {
                    width: 8%;
                }
                .label-wrapper {
                    @apply text-gray-400;
                    display: inline-flex;
                    font-size: 0.75rem;
                    padding: 6px 0;
                    .text {
                        @apply text-gray-500;
                        white-space: nowrap;
                        margin-left: 0.25rem;
                    }
                }
            }
            .right-part {
                width: 80%;

                @screen tablet {
                    width: 96%;
                }

                @screen mobile {
                    width: 92%;
                }
                font-size: 0.75rem;
                .col-wrapper {
                    position: relative;
                }
                .project-name {
                    @apply text-gray-700;
                    position: absolute;
                    display: block;
                    width: 95%;
                    bottom: 1.75rem;
                    left: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    transform: rotate(-50deg);
                }
                .box {
                    @apply border;
                    position: relative;
                    display: table;
                    width: 100%;
                    height: 100%;
                    font-weight: bold;
                    text-align: center;
                    vertical-align: middle;
                    &.error {
                        @apply bg-coral-100 border border-red-500 text-red-500;
                    }
                    &.warning {
                        @apply border border-yellow-500 text-yellow-500;
                    }
                    &.ok {
                        @apply border border-green-600 text-green-600;
                    }
                    &.empty {
                        @apply border border-gray-200 text-gray-300;
                    }
                    &:hover {
                        text-decoration: underline;
                        &.error {
                            @apply bg-coral-200;
                        }
                        &.warning {
                            @apply bg-yellow-100;
                        }
                        &.ok {
                            @apply bg-peacock-100;
                        }
                    }
                    .box-text {
                        display: table-cell;
                    }
                }
            }
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    padding-top: 2.5rem;
    padding-bottom: 1.25rem;
}
</style>
