<script setup lang="ts">

import {
    computed, ref,
} from 'vue';

import { useQuery } from '@tanstack/vue-query';
import { uniq } from 'lodash';

import {
    PFieldTitle, PEmpty, PPaneLayout, PI, PButton,
} from '@cloudforet/mirinae';

import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountListParameters } from '@/api-clients/identity/service-account/schema/api-verbs/list';

import ProjectCard from '@/services/project/v2/components/ProjectCard.vue';
import ProjectGroupCard from '@/services/project/v2/components/ProjectGroupCard.vue';
import { useProjectListStore } from '@/services/project/v2/stores/project-list-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    targetId?: string;
    targetType?: 'project' | 'projectGroup';
}>();

/* ui */
const isCollapsed = ref(false);

/* modal */
const projectPageModalStore = useProjectPageModalStore();

/* project list store */
const projectListStore = useProjectListStore();

/* filtered data */
const projects = computed(() => {
    if (props.targetType === 'projectGroup' && props.targetId) {
        return projectListStore.getProjectsByGroupId(props.targetId);
    }
    if (!props.targetType && !props.targetId) {
        return projectListStore.projects;
    }
    return [];
});

const projectGroups = computed(() => {
    if (props.targetType === 'projectGroup' && props.targetId) {
        return projectListStore.getProjectGroupsByParentId(props.targetId);
    }
    if (!props.targetType && !props.targetId) {
        return projectListStore.projectGroups;
    }
    return [];
});

/* service accounts */
const { serviceAccountAPI, serviceAccountListQueryKey } = useServiceAccountApi();
const serviceAccountListParams: ServiceAccountListParameters = {
    query: {
        only: ['provider', 'project_id'],
    },
};
const { data: serviceAccountList } = useQuery({
    queryKey: computed(() => [...serviceAccountListQueryKey.value, serviceAccountListParams]),
    queryFn: () => serviceAccountAPI.list(serviceAccountListParams),
    select: (data) => data.results ?? [],
});
const getDistinctProviders = (projectId: string): string[] => uniq(serviceAccountList.value?.filter((d) => d.project_id === projectId).map((d) => d.provider));

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
        <div v-show="!isCollapsed"
             class="pt-6"
        >
            <div v-if="projectGroups.length"
                 :class="{ 'pb-10' : !!projects.length }"
            >
                <p-field-title class="mb-3"
                               :label="$t('PROJECT.LANDING.PROJECT_GROUP')"
                >
                    <template #right>
                        ({{ projectGroups.length }})
                    </template>
                </p-field-title>
                <div class="card-contents">
                    <project-group-card v-for="(pg) in projectGroups"
                                        :key="pg.key"
                                        :project-group-id="pg.key"
                                        :name="pg.name"
                    />
                </div>
            </div>
            <div v-if="projects.length">
                <p-field-title class="mb-3"
                               :label="$t('PROJECT.LANDING.PROJECT')"
                >
                    <template #right>
                        ({{ projects.length }})
                    </template>
                </p-field-title>
                <div class="card-contents">
                    <project-card v-for="(p) in projects"
                                  :key="p.key"
                                  :project-id="p.key"
                                  :group-name="p.data.groupInfo?.name"
                                  :name="p.name"
                                  :project-type="p.data.projectType"
                                  :service-account-provider-list="getDistinctProviders(p.key)"
                    />
                </div>
            </div>
            <p-empty v-if="!projects.length && !projectGroups.length"
                     show-image
                     class="my-16"
            >
                <div>
                    <p>{{ $t('PROJECT.LANDING.EMPTY_TEXT') }}</p>
                </div>
            </p-empty>
        </div>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.card-contents {
    @apply grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(18.75rem, 1fr));
}
</style>
