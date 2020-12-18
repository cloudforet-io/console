<template>
    <widget-layout :title="$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE')">
        <p-data-table
            :loading="loading"
            :fields="fields"
            :items="data"
            :bordered="false"
        >
            <template #col-event-format="{ value }">
                <span class="event-name">{{ value.name }}</span>
                <span class="event-time">{{ value.lastUpdated }}</span>
            </template>
            <template #col-region-format="{ value }">
                <span class="region">{{ value }}</span>
            </template>
            <template #col-affected_projects-format="{ index, value }">
                <div class="affected-projects-wrapper grid grid-cols-12 gap-2">
                    <div class="count col-span-1">
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
import { random, find, shuffle } from 'lodash';
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs,
    ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';


enum EVENT_CATEGORY {
    notification = 'Notification',
    scheduledChange = 'Scheduled',
    issue = 'Issue',
}

export default {
    name: 'PersonalHealthDashboard',
    components: {
        PI,
        PDataTable,
        WidgetLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            projects: computed(() => store.state.resource.project.items),
            favoriteProjects: computed(() => store.state.favorite.project.items),
            timezone: computed(() => store.state.user.timezone),
            regions: computed(() => store.state.resource.region.items),
            data: [] as any[],
            fields: computed(() => [
                { name: 'event', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_EVENT') },
                { name: 'region', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_REGION') },
                { name: 'affected_projects', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_PROJECT_AFFECTED') },
            ]),
        });

        const getSummary = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.phdSummary({}, {
                    headers: { 'Mock-Mode': true },
                });

                state.data = res.results.map((d) => {
                    const utcNow = dayjs().utc();
                    const lastUpdated = dayjs(d.last_updated_time).utc();
                    let utcDiff: number = utcNow.diff(lastUpdated, 'hour');
                    let unit = vm.$tc('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.HOUR', utcDiff);
                    if (utcDiff > 24) {
                        utcDiff = utcNow.diff(lastUpdated, 'day');
                        unit = vm.$tc('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.DAY', utcDiff);
                    }

                    // todo: removed
                    const sampleProjects = shuffle(Object.keys(state.projects).slice(0, random(1, 10)));

                    return {
                        event: {
                            name: `${d.service} ${d.event_type_code} ${EVENT_CATEGORY[d.event_type_category]}`,
                            lastUpdated: `${utcDiff} ${unit} ${vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.AGO')}`,
                        },
                        region: d.region_code, // todo: state.regions[d.region_code].name,
                        affected_projects: sampleProjects.map(projectId => ({
                            name: state.projects[projectId].name,
                            to: referenceRouter(projectId, { resource_type: 'identity.Project' }),
                            isFavorite: !!find(state.favoriteProjects, { id: projectId }),
                        })), // todo: d.affected_projects,
                        showAll: false,
                    };
                });
            } catch (e) {
                console.error(e);
            }
        };

        const onClickToggle = (index) => {
            const showAll: boolean = state.data[index].showAll;
            state.data[index].showAll = !showAll;
        };

        const init = async () => {
            await store.dispatch('resource/project/load');
            await store.dispatch('favorite/project/load');
            await getSummary();
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
.p-data-table::v-deep {
    min-height: 8rem;
    border-radius: 0.125rem;
    margin-top: 0.75rem;
    th {
        @apply bg-gray-100 text-gray-400;
        height: 1.5rem;
        border: none;
        font-size: 0.75rem;
    }
    tr {
        .td {
            @apply bg-white;
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
        .event-name {
            display: block;
            max-width: 14rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 0.875rem;
            line-height: 1.4;
        }
        .event-time {
            @apply text-gray-700;
            font-size: 0.75rem;
            line-height: 1.2;
        }
        .region {
            display: block;
            max-width: 12rem;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .affected-projects-wrapper {
            min-width: 20rem;
            font-size: 0.875rem;
            line-height: 1.6;
            padding: 0.5rem 0;
            .count {
                @apply text-primary1;
                font-weight: bold;
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
