<script setup lang="ts">

import { computed, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { uniq } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldTitle, PToolbox, PEmpty, PPaneLayout,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceAccountListParameters } from '@/schema/identity/service-account/api-verbs/list';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import { i18n } from '@/translations';

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
    filteredCardList: computed<ProjectCardItemType[]>(() => {
        const projectGroupListFilteredByKeyword = state.currentProjectGroupList.filter((item) => item.name.includes(state.searchText));
        const projectListFilteredByKeyword = state.currentProjectList.filter((item) => item.name.includes(state.searchText));
        return [...projectGroupListFilteredByKeyword, ...projectListFilteredByKeyword];
    }),
    paginatedCardList: computed(() => ({
        projectGroup: state.filteredCardList.filter((item) => item.type === 'projectGroup'),
        project: state.filteredCardList.filter((item) => item.type === 'project'),
    })),
    searchText: '',
    searchResultLabelText: computed(() => `${i18n.t('PROJECT.LANDING.SEARCH_RESULT_LABEL')} "${state.searchText}"`),
    placeholer: computed(() => {
        const defaultPlaceholder = i18n.t('PROJECT.LANDING.SEARCH_PLACEHOLDER') as string;
        return defaultPlaceholder;
    }),
});

/* Event */
const handleChange = async (options?: any) => {
    if (options?.searchText !== undefined) {
        state.searchText = options.searchText;
    }
};

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
    <p-pane-layout class="project-main">
        <p-toolbox class="project-tool-box"
                   :placeholder="state.placeholer"
                   :pagination-visible="false"
                   :page-size-changeable="false"
                   :refreshable="false"
                   @change="handleChange"
        />
        <div class="project-contents">
            <p v-if="state.searchText"
               class="search-result-label"
            >
                {{ state.searchResultLabelText }}
            </p>
            <div v-if="state.paginatedCardList.projectGroup.length"
                 class="contents-wrapper"
            >
                <p-field-title v-if="!state.searchText"
                               class="content-title"
                               :label="$t('PROJECT.LANDING.PROJECT_GROUP')"
                />
                <div class="card-contents">
                    <project-main-project-group-card v-for="(projectGroup, idx) in state.paginatedCardList.projectGroup"
                                                     :key="`project-group-${idx}`"
                                                     :item="projectGroup"
                    />
                </div>
            </div>

            <div v-if="state.paginatedCardList.project.length"
                 class="contents-wrapper"
            >
                <p-field-title v-if="!state.searchText"
                               class="content-title"
                               :label="$t('PROJECT.LANDING.PROJECT')"
                />
                <div class="card-contents">
                    <project-main-project-card v-for="(project, idx) in state.paginatedCardList.project"
                                               :key="`project-${idx}`"
                                               :item="project"
                                               :service-account-provider-list="getDistinctProviders(project.id)"
                    />
                </div>
            </div>

            <p-empty v-if="!state.filteredCardList.length"
                     show-image
                     class="empty-contents"
            >
                <div class="empty-text">
                    <p>{{ state.searchText ? $t('PROJECT.LANDING.EMPTY_TEXT_SEARCH') : $t('PROJECT.LANDING.EMPTY_TEXT') }}</p>
                </div>
            </p-empty>
        </div>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.project-main {
    padding: 1.5rem 1rem 2.5rem;

    .project-tool-box {
        margin-bottom: 0.5rem;
    }

    .search-result-label {
        @apply text-label-md font-bold text-gray-900;
        margin-bottom: 1.5rem;
    }

    .project-contents {
        .contents-wrapper {
            margin-bottom: 1.5rem;

            .content-title {
                margin-bottom: 0.5rem;
            }
        }
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
}
</style>
