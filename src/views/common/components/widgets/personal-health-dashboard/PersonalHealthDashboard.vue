<template>
    <widget-layout>
        <template #title>
            <div class="title">
                <span :style="{ 'color': providers.aws ? providers.aws.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE') }}</span>
            </div>
        </template>
        <p-data-table
            :loading="loading"
            :fields="fields"
            :items="data"
            :bordered="false"
        >
            <template #col-event-format="{ index, value }">
                <div class="col-event">
                    <span class="event-name">
                        <router-link :to="value.to" class="link-text">
                            <span>{{ value.name }}</span>
                        </router-link>
                    </span>
                    <span class="event-time" :class="{ 'show-all': data[index].showAll }">{{ value.lastUpdate }}</span>
                </div>
            </template>
            <template #col-region-format="{ value }">
                <span class="region">{{ value }}</span>
            </template>
            <template #col-affected_projects-format="{ index, value }">
                <div class="affected-projects-wrapper grid grid-cols-12 gap-2">
                    <div class="count col-span-1" :class="{ 'show-all': data[index].showAll }">
                        {{ value.length }}
                    </div>
                    <div class="col-span-9 project-link-group" :class="{ 'show-all': data[index].showAll }">
                        <div v-for="(project, index) in value" :key="index">
                            <p-i v-if="project.isFavorite" name="ic_bookmark"
                                 class="favorite-icon"
                                 width="0.625rem" height="0.625rem"
                            />
                            <router-link :to="project.to" class="project-link">
                                {{ project.name }}
                            </router-link>
                        </div>
                    </div>
                    <div class="col-span-2">
                        <div v-show="value.length > 1"
                             class="toggle-button"
                             @click="onClickToggle(index)"
                        >
                            {{ data[index].showAll ? $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.HIDE') : $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.ALL') }}
                            <p-i :name="data[index].showAll ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                                 height="1rem" width="1rem" color="inherit transparent"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </p-data-table>
    </widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { find } from 'lodash';
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs,
    ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import { PDataTable, PI } from '@spaceone/design-system';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';


const EVENT_PERIOD = 7;

export default {
    name: 'PersonalHealthDashboard',
    components: {
        PI,
        PDataTable,
        WidgetLayout,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            timezone: computed(() => store.state.user.timezone),
            projects: computed(() => store.state.resource.project.items),
            favoriteProjects: computed(() => store.state.favorite.project.items),
            regions: computed(() => store.state.resource.region.items),
            data: [] as any[],
            fields: computed(() => [
                { name: 'event', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_EVENT') },
                { name: 'region', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_REGION') },
                { name: 'affected_projects', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_AFFECTED_PROJECT') },
            ]),
        });

        /* api */
        const getData = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.phdSummary({
                    period: EVENT_PERIOD,
                });

                state.data = res.results.map((d) => {
                    const lastUpdateTime = dayjs.tz(dayjs(d.last_update_time).utc(), state.timezone).format('YYYY-MM-DD HH:mm:ss');

                    return {
                        event: {
                            name: d.event_title,
                            lastUpdate: `${vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.LAST_UPDATE')} : ${lastUpdateTime}`,
                            to: referenceRouter(d.resource_id, { resource_type: 'inventory.CloudService' }),
                        },
                        region: state.regions[d.region_code]?.name || d.region_code,
                        affected_projects: d.affected_projects.map(projectId => ({
                            name: state.projects[projectId].name,
                            to: referenceRouter(projectId, { resource_type: 'identity.Project' }),
                            isFavorite: !!find(state.favoriteProjects, { id: projectId }),
                        })).sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)),
                        showAll: false,
                    };
                });
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onClickToggle = (index) => {
            const showAll: boolean = state.data[index].showAll;
            state.data[index].showAll = !showAll;
        };

        const init = async () => {
            state.loading = true;
            await Promise.all([
                store.dispatch('resource/project/load'),
                store.dispatch('favorite/project/load'),
                store.dispatch('resource/region/load'),
            ]);
            await getData();
            state.loading = false;
        };
        init();

        return {
            ...toRefs(state),
            onClickToggle,
        };
    },
};
</script>

<style lang="postcss" scoped>
.widget-layout::v-deep {
    .title {
        font-size: 1.125rem;
        font-weight: bold;
        line-height: 1.2;
    }
}
.p-data-table::v-deep {
    min-height: 8rem;
    border-radius: 0.125rem;
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
                @apply text-blue-600;
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
</style>
