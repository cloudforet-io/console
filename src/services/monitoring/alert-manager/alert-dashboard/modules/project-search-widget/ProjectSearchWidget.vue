<template>
    <div class="project-search-widget">
        <p-toolbox search-type="query"
                   :query-tags="tags"
                   :key-item-sets="handlers.keyItemSets"
                   :value-handler-map="handlers.valueHandlerMap"
                   :total-count="totalCount"
                   :page-size.sync="pageLimit"
                   :page-size-options="[12, 24, 36]"
                   @change="onChange"
                   @refresh="onChange()"
        />
        <div class="box-group">
            <div v-for="(item, idx) in items" :key="`box-${idx}`" class="box"
                 @click="onClickProjectBox(item)"
            >
                <p class="sub-title">
                    {{ projectGroupNameFormatter(item.project_id) }}
                </p>
                <p class="title">
                    {{ projectNameFormatter(item.project_id) }}
                </p>
                <div class="content-wrapper" :class="{'multiple-items': item.alert_count > 0 && item.maintenance_window_count > 0}">
                    <project-maintenance-window-list-item v-if="item.maintenance_window_count > 0" :project-id="item.project_id" />
                    <project-alert-list-item v-if="item.alert_count > 0" :project-id="item.project_id" />
                </div>
            </div>
        </div>
        <p-pane-layout v-if="isHealthy" class="project-healthy">
            <p-i name="smile-face"
                 width="3rem"
                 height="3rem"
                 color="inherit"
            />
            <p>{{ $t('MONITORING.ALERT.DASHBOARD.PROJECTS_HEALTHY') }}</p>
        </p-pane-layout>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PPaneLayout, PToolbox, PI } from '@spaceone/design-system';
import ProjectAlertListItem from '@/services/monitoring/alert-manager/alert-dashboard/modules/project-search-widget/ProjectAlertListItem.vue';
import ProjectMaintenanceWindowListItem from '@/services/monitoring/alert-manager/alert-dashboard/modules/project-search-widget/ProjectMaintenanceWindowListItem.vue';

import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { makeReferenceValueHandler } from '@spaceone/console-core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { store } from '@/store';
import { PROJECT_ROUTE } from '@/services/project/routes';


export default {
    name: 'ProjectSearchWidget',
    components: {
        PToolbox,
        PPaneLayout,
        PI,
        ProjectAlertListItem,
        ProjectMaintenanceWindowListItem,
    },
    props: {
        activatedProjects: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            totalCount: 0,
            pageLimit: 12,
            items: [],
            tags: [],
            loading: true,
            isHealthy: computed(() => {
                if (state.totalCount === 0 && props.activatedProjects.length > 0 && !state.loading) return true;
                return false;
            }),
        });
        const handlers = {
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'project_id', label: 'Project' },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: {
                project_id: makeReferenceValueHandler('identity.Project'),
            },
        };

        /* util */
        const projectGroupNameFormatter = (projectId) => {
            const projectLabel = state.projects[projectId]?.label;
            const projectName = state.projects[projectId]?.name;
            if (!projectLabel || projectLabel === projectName) return undefined;
            return projectLabel.replace(` > ${projectName}`, '');
        };
        const projectNameFormatter = projectId => state.projects[projectId]?.name || projectId;
        const countFormatter = (count) => {
            if (count > 15) return '15+';
            return count;
        };

        /* api */
        const AlertByProjectApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(state.pageLimit);
        let AlertByProjectApiQuery = AlertByProjectApiQueryHelper.data;
        const listAlertByProject = async () => {
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.dashboard.alertByProject({
                    // eslint-disable-next-line camelcase
                    activated_projects: props.activatedProjects,
                    query: AlertByProjectApiQuery,
                });
                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onChange = async (options: any) => {
            AlertByProjectApiQuery = getApiQueryWithToolboxOptions(AlertByProjectApiQueryHelper, options) ?? AlertByProjectApiQuery;
            await listAlertByProject();
        };
        const onClickProjectBox = (item) => {
            if (item.maintenance_window_count > 0) {
                vm.$router.push({ name: PROJECT_ROUTE.DETAIL.TAB.ALERT.MAINTENANCE_WINDOW._NAME, params: { id: item.project_id } });
            } else {
                vm.$router.push({ name: PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME, params: { id: item.project_id } });
            }
        };

        /* init */
        watch(() => props.activatedProjects, async (activatedProjects) => {
            if (activatedProjects.length) {
                await listAlertByProject();
            }
        });

        return {
            ...toRefs(state),
            handlers,
            onChange,
            onClickProjectBox,
            projectGroupNameFormatter,
            projectNameFormatter,
            countFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-search-widget {
    .p-toolbox::v-deep {
        .p-search {
            @apply rounded-md;
        }
    }

    .box-group {
        @apply grid grid-cols-12;
        gap: 1rem;

        .box {
            @apply col-span-6 bg-white border border-gray-200 rounded-md;
            height: 20rem;
            box-sizing: border-box;
            box-shadow: 0 0.125rem 0.25rem rgba(theme('colors.black'), 0.06);
            cursor: pointer;
            padding: 1rem;

            &:hover {
                @apply bg-secondary2;
            }

            .sub-title {
                @apply text-gray-500;
                line-height: 1.3;
                font-size: 0.75rem;
            }
            .title {
                line-height: 1.6;
                font-size: 1rem;
                font-weight: bold;
                margin-bottom: 0.75rem;
            }
            .content-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;

                .project-maintenance-window-list-item::v-deep, .project-alert-list-item::v-deep {
                    .body {
                        max-height: 12.5rem;
                    }
                }

                &.multiple-items {
                    .project-maintenance-window-list-item::v-deep, .project-alert-list-item::v-deep {
                        .body {
                            max-height: 5rem;
                        }
                    }
                }
            }
        }
    }

    .project-healthy {
        @apply bg-green-100 text-green-500 text-center;
        padding: 3rem 0;
        margin-top: 0.5rem;
        .p-i-icon {
            margin: 0 auto;
        }
        p {
            margin-top: 0.5rem;
            color: inherit;
            font-size: 1rem;
            line-height: 1.6;
        }
    }

    @screen mobile {
        .box-group {
            .box {
                @apply col-span-12;
            }
        }
    }
}
</style>
