<script setup lang="ts">

import { computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PFieldTitle,
} from '@spaceone/design-system';
import { uniq } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectMainProjectCard from '@/services/project/components/ProjectMainProjectCard.vue';
import ProjectMainProjectGroupCard from '@/services/project/components/ProjectMainProjectGroupCard.vue';
import type { ProjectCardItemType } from '@/services/project/types/project-type';


const route = useRoute();
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroup: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
});

const state = reactive({
    currentProjectGroupId: computed(() => route.params.projectGroupId),
    serviceAccountList: [] as ServiceAccountModel[],
    currentProjectGroupList: computed<ProjectCardItemType[]>(() => {
        const allProjectGroupList: ProjectCardItemType[] = Object.values(storeState.projectGroup).map((d) => ({
            id: d.key,
            name: d.name,
            parentId: d.data.parentGroupInfo?.id as string|undefined,
        }));
        return allProjectGroupList.filter((item) => item.parentId === state.currentProjectGroupId);
    }),
    currentProjectList: computed<ProjectCardItemType[]>(() => {
        const allProjectList: ProjectCardItemType[] = Object.values(storeState.project).map((d) => ({
            id: d.key,
            name: d.name,
            parentId: d.data.groupInfo?.id,
            projectType: d.data.projectType,
        }));
        return allProjectList.filter((item) => item.parentId === state.currentProjectGroupId);
    }),
});



/* Utill */
const getDistinctProviders = (projectId: string): string[] => uniq(state.serviceAccountList.filter((d) => d.project_id === projectId).map((d) => d.provider));


const listServiceAccount = async () => {
    try {
        const params: ServiceAccountListParameters = {
            query: {
                only: ['provider', 'project_id'],
            },
        };
        const response = await SpaceConnector.clientV2.identity.serviceAccount.list<ServiceAccountListParameters, ListResponse<ServiceAccountModel>>(params);
        state.serviceAccountList = response.results || [];
    } catch (e) {
        state.serviceAccountList = [];
        ErrorHandler.handleError(e);
    }
};

onMounted(async () => {
    await listServiceAccount();
});

</script>

<template>
    <div class="project-main">
        <div class="project-contents">
            <div v-if="state.currentProjectGroupList.length"
                 class="contents-wrapper"
            >
                <p-field-title class="content-title"
                               :label="$t('Project Group')"
                >
                    <template #right>
                        <span>({{ state.currentProjectGroupList.length }})</span>
                    </template>
                </p-field-title>
                <div class="card-contents">
                    <project-main-project-group-card v-for="(projectGroup, idx) in state.currentProjectGroupList"
                                                     :key="`project-group-${idx}`"
                                                     :item="projectGroup"
                    />
                </div>
            </div>

            <div v-if="state.currentProjectList.length"
                 class="contents-wrapper"
            >
                <p-field-title v-if="state.currentProjectList.length"
                               class="content-title"
                               :label="$t('Project')"
                >
                    <template #right>
                        <span>({{ state.currentProjectList.length }})</span>
                    </template>
                </p-field-title>
                <div class="card-contents">
                    <project-main-project-card v-for="(project, idx) in state.currentProjectList"
                                               :key="`project-${idx}`"
                                               :item="project"
                                               :service-account-provider-list="getDistinctProviders(project.id)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.project-main {

    .project-contents {
        .contents-wrapper {
            margin-bottom: 1.5rem;

            .content-title {
                margin-bottom: 0.5rem;
            }

            .card-contents {
                @apply grid;
                gap: 1rem;
                grid-template-columns: repeat(auto-fill, minmax(18.75rem, 1fr));
            }
        }
    }
}
</style>
