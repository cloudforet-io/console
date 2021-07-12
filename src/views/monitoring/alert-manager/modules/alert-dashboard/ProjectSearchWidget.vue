<template>
    <div class="project-search-widget">
        <p-toolbox search-type="query"
                   :query-tags="tags"
                   :key-item-sets="handlers.keyItemSets"
                   :value-handler-map="handlers.valueHandlerMap"
                   :total-count="totalCount"
                   @change="onChange"
                   @refresh="onChange()"
        />
        <div class="box-group">
            <div v-for="(item, idx) in items" :key="`box-${idx}`" class="box">
                <p class="sub-title">
                    {{ projectGroupNameFormatter(item.project_id) }}
                </p>
                <p class="title">
                    {{ projectNameFormatter(item.project_id) }}
                </p>
                <div class="content-wrapper">
                    <!--                    <project-maintenance-window-list-item v-if="item.maintenance_window_count > 0" :project-id="item.project_id" />-->
                    <project-alert-list-item v-if="item.alert_count > 0" :project-id="item.project_id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PToolbox } from '@spaceone/design-system';
import ProjectAlertListItem from '@/views/monitoring/alert-manager/modules/alert-dashboard/ProjectAlertListItem.vue';
import ProjectMaintenanceWindowListItem from '@/views/monitoring/alert-manager/modules/alert-dashboard/ProjectMaintenanceWindowListItem.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { makeReferenceValueHandler } from '@spaceone/console-core-lib/component-util/query-search';
import { store } from '@/store';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';


export default {
    name: 'ProjectSearchWidget',
    components: {
        PToolbox,
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
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            totalCount: 0,
            items: [],
            tags: [],
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
        // const AlertByProjectApiQueryHelper = new ApiQueryHelper()
        //     .setPageStart(1).setPageLimit(24);
        // let AlertByProjectApiQuery = AlertByProjectApiQueryHelper.data;
        const listAlertByProject = async () => {
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.dashboard.alertByProject({
                    // eslint-disable-next-line camelcase
                    activated_projects: props.activatedProjects,
                    // query: AlertByProjectApiQuery,
                });
                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onChange = async (options: any) => {
            // AlertByProjectApiQuery = getApiQueryWithToolboxOptions(AlertByProjectApiQueryHelper, options) ?? AlertByProjectApiQuery;
            // if (options.queryTags !== undefined) {
            //     await replaceUrlQuery('filters', AlertByProjectApiQueryHelper.rawQueryStrings);
            // }
            await listAlertByProject();
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
            border-radius: 0.25rem;
        }
    }

    .box-group {
        @apply grid grid-cols-12;
        gap: 1rem;

        .box {
            @apply col-span-6 bg-white border border-gray-200 rounded-md;
            height: 20.375rem;
            box-sizing: border-box;
            box-shadow: 0 0.125rem 0.25rem rgba(theme('colors.black'), 0.06);
            padding: 1rem;

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
                height: 15rem;
            }
        }
    }

    @screen tablet {
        .box-group {
            .box {
                height: 21.375rem;
            }
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
