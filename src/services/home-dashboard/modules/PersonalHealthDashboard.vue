<template>
    <widget-layout>
        <template #title>
            <p class="title">
                <span :style="{ 'color': providers.aws ? providers.aws.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE') }}</span>
            </p>
        </template>
        <p-data-loader
            :data="data"
            :loading="loading"
        >
            <p-data-table
                :loading="loading"
                :fields="fields"
                :items="data"
                :bordered="false"
            >
                <template #col-event-format="{ index, value }">
                    <div class="col-event">
                        <span class="event-name">
                            <router-link :to="value.to"
                                         class="link-text"
                            >
                                <span>{{ value.name }}</span>
                            </router-link>
                        </span>
                        <span class="event-time"
                              :class="{ 'show-all': data[index].showAll }"
                        >
                            {{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.LAST_UPDATE') }} : {{ value.lastUpdate }}
                        </span>
                    </div>
                </template>
                <template #col-region-format="{ value }">
                    <span class="region">{{ value }}</span>
                </template>
                <template #col-affected_projects-format="{ index, value }">
                    <div class="affected-projects-wrapper grid grid-cols-12 gap-2">
                        <div class="count col-span-1"
                             :class="{ 'show-all': data[index].showAll }"
                        >
                            {{ value.length }}
                        </div>
                        <div class="col-span-9 project-link-group"
                             :class="{ 'show-all': data[index].showAll }"
                        >
                            <div v-for="(project, pIndex) in value"
                                 :key="`project-link-${project.name}-${pIndex}`"
                            >
                                <p-i v-if="project.isFavorite"
                                     name="ic_bookmark"
                                     class="favorite-icon"
                                     width="0.625rem"
                                     height="0.625rem"
                                />
                                <router-link :to="project.to"
                                             class="project-link"
                                >
                                    {{ project.name }}
                                </router-link>
                            </div>
                        </div>
                        <div class="col-span-2">
                            <div v-show="value.length > 1"
                                 class="toggle-button"
                                 @click="handleClickToggle(index)"
                            >
                                {{ data[index].showAll ? $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.HIDE') : $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.ALL') }}
                                <p-i :name="data[index].showAll ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                                     height="1rem"
                                     width="1rem"
                                     color="inherit transparent"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </p-data-table>
            <template #no-data>
                <p-empty
                    show-image
                    image-size="md"
                    :title="$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.NO_DATA_TITLE')"
                >
                    <template #image>
                        <img alt="illust_astronaut_radio"
                             src="@/assets/images/illust_astronaut_radio.svg"
                        >
                    </template>
                    {{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.NO_DATA') }}
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
    PDataTable, PI, PEmpty, PDataLoader,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

const EVENT_PERIOD = 7;

export default {
    name: 'PersonalHealthDashboard',
    components: {
        PI,
        PDataTable,
        WidgetLayout,
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
        const state = reactive({
            loading: false,
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
            timezone: computed(() => store.state.user.timezone),
            favoriteProjects: computed(() => store.state.favorite.projectItems),
            data: [] as any[],
            fields: computed(() => [
                { name: 'event', label: i18n.t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_EVENT') },
                { name: 'region', label: i18n.t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_REGION') },
                { name: 'affected_projects', label: i18n.t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_AFFECTED_PROJECT') },
            ]),
        });

        /* Util */
        const getConvertedData = (rawData, projects: ProjectReferenceMap) => rawData.map((d) => {
            const lastUpdateTime = dayjs.tz(dayjs(d.last_update_time).utc(), state.timezone).format('YYYY-MM-DD HH:mm:ss');

            return {
                event: {
                    name: d.event_title,
                    lastUpdate: lastUpdateTime,
                    to: referenceRouter(d.resource_id, { resource_type: 'inventory.CloudService' }),
                },
                region: state.regions[d.region_code]?.name || d.region_code,
                affected_projects: d.affected_projects.map((projectId) => ({
                    name: projects[projectId].name,
                    to: referenceRouter(projectId, { resource_type: 'identity.Project' }),
                    isFavorite: !!find(state.favoriteProjects, { id: projectId }),
                })).sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)),
                showAll: false,
            };
        });

        /* Api */
        const getData = async () => {
            state.loading = true;
            try {
                const { results } = await SpaceConnector.client.statistics.topic.phdSummary({
                    ...props.extraParams,
                    period: EVENT_PERIOD,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const handleClickToggle = (index) => {
            const showAll: boolean = state.data[index].showAll;
            state.data[index].showAll = !showAll;
        };

        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
                store.dispatch('reference/region/load'),
            ]);
        })();

        /* Watcher */
        watch(() => store.state.reference.project.items, async (projects) => {
            if (projects) {
                const rawData = await getData();
                state.data = getConvertedData(rawData, projects);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleClickToggle,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    @apply font-bold text-label-xl;
    line-height: 1.2;
}

/* custom design-system component - p-data-table */
:deep(.p-data-table) {
    min-height: 8rem;
    margin-top: 0.75rem;
    .table-container {
        max-height: 25rem;
    }
    th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
    }
    tr {
        td {
            vertical-align: initial;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }
        &:nth-child(even) {
            td {
                @apply bg-primary4;
            }
        }
    }
    td {
        @apply bg-white;
        height: 3.375rem;
        .col-event {
            .event-name {
                display: block;
                font-size: 0.875rem;
                line-height: 1.4;
                .link-text {
                    @apply text-secondary;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
            .event-time {
                @apply text-gray-700;
                font-size: 0.75rem;
                line-height: 1.2;
                &.show-all {
                    @apply text-gray-900;
                }
            }
        }
        .region {
            display: block;
            line-height: 1.4;
        }
        .affected-projects-wrapper {
            min-width: 20rem;
            font-size: 0.875rem;
            line-height: 1.6;
            .count {
                @apply text-primary1;
                font-weight: bold;
                &.show-all {
                    @apply text-primary;
                }
            }
            .project-link-group {
                display: flex;
                flex-wrap: wrap;
                height: 1.4rem;
                overflow: hidden;
                &.show-all {
                    height: auto;
                }
                .favorite-icon {
                    margin-bottom: 0.25rem;
                }
                .project-link {
                    @apply text-gray-700;
                    margin-right: 1rem;
                    &:hover {
                        @apply bg-blue-200 text-primary-dark;
                        text-decoration: underline;
                    }
                }
            }
            .toggle-button {
                @apply text-blue-700;
                font-size: 0.75rem;
                text-align: right;
                cursor: pointer;
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    padding-top: 2.5rem;
    padding-bottom: 1.5rem;
}
</style>
