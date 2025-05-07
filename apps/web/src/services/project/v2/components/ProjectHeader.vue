<script setup lang="ts">
import {
    computed, ref, toRef, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PI, PSkeleton, PHeading, PHeadingLayout, PButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { NoResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import ProjectActionDropdownButton from '@/services/project/v2/components/ProjectActionDropdownButton.vue';
import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectIcons } from '@/services/project/v2/composables/use-project-icons';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const props = defineProps<{
    projectId?: string;
    projectGroupId?: string;
}>();


const projectPageModalStore = useProjectPageModalStore();

/* project and project group query control */
const appContextStore = useAppContextStore();
const enabled = computed(() => !appContextStore.getters.globalGrantLoading);

/* project */
const { data: project, error: projectError, isLoading: loadingProject } = useProjectQuery({
    projectId: toRef(props, 'projectId'),
    enabled,
});

/* project group */
const { data: projectGroup, error: projectGroupError, isLoading: loadingProjectGroup } = useProjectGroupQuery({
    projectGroupId: toRef(props, 'projectGroupId'),
    enabled,
});

/* errors */
watch([projectError, projectGroupError], ([prjErr, pgErr]) => {
    if (prjErr || pgErr) ErrorHandler.handleError(new NoResourceError({ name: PROJECT_ROUTE_V2._NAME }));
});

/* title and members count */
const hasProjectOrGroupId = computed(() => !!(props.projectId || props.projectGroupId));
// Using ref instead of computed for title and membersCount to show the previously selected value in the UI while loading new data.
// This prevents UI flickering during data loading.
const title = ref<TranslateResult|undefined>(undefined);
const membersCount = ref<number|undefined>(undefined);
watch([project, projectGroup, hasProjectOrGroupId], ([prj, pg, exist]) => {
    if (!exist) {
        title.value = i18n.t('PROJECT.LANDING.ALL_PROJECTS');
        membersCount.value = undefined;
        return;
    }
    if (prj && !pg) {
        title.value = prj.name;
        if (prj.project_type === 'PRIVATE') {
            membersCount.value = prj.users?.length ?? 0;
        } else {
            membersCount.value = undefined;
        }
        return;
    }
    if (!prj && pg) {
        title.value = pg.name;
        membersCount.value = pg.users?.length ?? 0;
    }
}, { immediate: true });

/* Event Handlers */
const handleClickManageMember = () => {
    if (props.projectId) projectPageModalStore.openProjectMemberModal(props.projectId);
    else if (props.projectGroupId) projectPageModalStore.openProjectGroupMemberModal(props.projectGroupId);
};

/* icon */
const { projectGroupIcon, projectIcon } = useProjectIcons();
const showIcon = computed(() => loadingProject || loadingProjectGroup || projectError || projectGroupError || project || projectGroup);
const iconName = computed(() => (project.value ? projectIcon : projectGroupIcon.iconName));
const iconColor = computed(() => (project ? undefined : projectGroupIcon.iconColor));

</script>

<template>
    <p-heading-layout>
        <template #heading>
            <p-heading>
                <template #title-left-extra>
                    <div v-show="showIcon"
                         class="inline-flex items-center justify-center border-2 border-white w-14 h-14 rounded-2xl bg-white/50 cursor-pointer"
                    >
                        <p-i :name="iconName"
                             width="1.5rem"
                             height="1.5rem"
                             :color="iconColor"
                        />
                    </div>
                </template>
                <template #default>
                    <template v-if="projectError || projectGroupError">
                        No Project
                    </template>
                    <template v-else-if="title">
                        {{ title }}
                    </template>
                    <p-skeleton v-else
                                width="200px"
                                height="24px"
                    />
                </template>
                <template #title-right-extra>
                    <div v-if="hasProjectOrGroupId"
                         class="inline-flex flex-wrap gap-2"
                    >
                        <p-button v-if="membersCount !== undefined"
                                  style-type="tertiary"
                                  size="sm"
                                  @click="handleClickManageMember"
                        >
                            {{ $t('PROJECT.DETAIL.MEMBERS') }} ({{ membersCount }})
                        </p-button>
                        <project-action-dropdown-button :project-id="props.projectId"
                                                        :project-group-id="props.projectGroupId"
                        />
                    </div>
                </template>
            </p-heading>
        </template>
    </p-heading-layout>
</template>
