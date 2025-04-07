<script setup lang="ts">

import {
    computed, onMounted, reactive, ref,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { uniq } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldTitle, PEmpty, PPaneLayout, PI, PButton,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useProjectGroupReferenceStore, type ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useProjectReferenceStore, type ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ProjectCardItemType } from '@/services/project/v-shared/types/project-type';
import ProjectCard from '@/services/project/v2/components/ProjectCard.vue';
import ProjectGroupCard from '@/services/project/v2/components/ProjectGroupCard.vue';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    targetId?: string;
    targetType?: 'project' | 'projectGroup';
}>();

/* ui */
const isCollapsed = ref(false);

/* modal */
const projectPageModalStore = useProjectPageModalStore();

/* project */
const projectReferenceStore = useProjectReferenceStore();
const allProjects = computed(() => Object.values(projectReferenceStore.getters.projectItems));
const projects = computed(() => {
    if (props.targetType === 'projectGroup') {
        if (props.targetId) return allProjects.value.filter((d) => d.data.groupInfo?.id === props.targetId);
        return allProjects.value;
    }
    return [];
});


/* project group */
const projectGroupReferenceStore = useProjectGroupReferenceStore();
const allProjectGroups = computed(() => Object.values(projectGroupReferenceStore.getters.projectGroupItems));
const projectGroups = computed(() => {
    if (props.targetType === 'projectGroup') {
        if (props.targetId) return allProjectGroups.value.filter((d) => d.data.parentGroupInfo?.id === props.targetId);
        return allProjectGroups.value;
    }
    return [];
});

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
            type: 'projectGroup',
            id: d.key,
            name: d.name,
            parentId: d.data.parentGroupInfo?.id as string|undefined,
        }));
        return allProjectGroupList.filter((projectGroup) => projectGroup.parentId === state.currentProjectGroupId);
    }),
    currentProjectList: computed<ProjectCardItemType[]>(() => {
        const allProjectList: ProjectCardItemType[] = Object.values(storeState.project).map((d) => ({
            type: 'project',
            id: d.key,
            name: d.name,
            parentId: d.data.groupInfo?.id,
            projectType: d.data.projectType,
        }));
        return allProjectList.filter((project) => project.parentId === state.currentProjectGroupId);
    }),
    filteredCardList: computed<ProjectCardItemType[]>(() => [...state.currentProjectGroupList, ...state.currentProjectList]),
});

/* Util */
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
    <p-pane-layout class="p-4">
        <div class="flex justify-between items-center flex-wrap">
            <div class="flex items-center gap-[2px]">
                <p-i :name="isCollapsed ? 'ic_chevron-right' : 'ic_chevron-down'"
                     width="1.5rem"
                     height="1.5rem"
                     class="cursor-pointer"
                     @click="isCollapsed = !isCollapsed"
                />
                <div class="text-label-lg font-medium">
                    {{ $t('PROJECT.LADING.GROUPS_AND_PROJECTS') }}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <p-button icon-left="ic_plus"
                          style-type="tertiary"
                          size="md"
                          @click="projectPageModalStore.openCreateProjectGroupFormModal()"
                >
                    {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                </p-button>
                <p-button icon-left="ic_plus"
                          style-type="primary"
                          size="md"
                          @click="projectPageModalStore.openCreateProjectFormModal()"
                >
                    {{ $t('PROJECT.LANDING.CREATE_PROJECT') }}
                </p-button>
            </div>
        </div>
        <div v-show="!isCollapsed">
            <div v-if="projectGroups.length"
                 class="pt-6 pb-10"
            >
                <p-field-title class="title"
                               :label="$t('PROJECT.LANDING.PROJECT_GROUP')"
                />
                <div class="card-contents">
                    <project-group-card v-for="(pg, idx) in projectGroups"
                                        :key="`project-group-${idx}`"
                                        :project-group-id="pg.key"
                                        :name="pg.name"
                    />
                </div>
            </div>

            <div v-if="projects.length">
                <p-field-title class="title"
                               :label="$t('PROJECT.LANDING.PROJECT')"
                />
                <div class="card-contents">
                    <project-card v-for="(p, idx) in projects"
                                  :key="`project-${idx}`"
                                  :project-id="p.key"
                                  :group-name="p.data.groupInfo?.name"
                                  :name="p.name"
                                  :project-type="p.data.projectType"
                                  :service-account-provider-list="getDistinctProviders(p.key)"
                    />
                </div>
            </div>

            <p-empty v-if="!state.filteredCardList.length"
                     show-image
                     class="empty-contents"
            >
                <div class="empty-text">
                    <p>{{ $t('PROJECT.LANDING.EMPTY_TEXT') }}</p>
                </div>
            </p-empty>
        </div>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.title {
    @apply mb-3;
}
.card-contents {
    @apply grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(18.75rem, 1fr));
}
.empty-contents {
    margin-top: 4rem;
    .empty-text {
        width: 20rem;
    }
}
</style>
