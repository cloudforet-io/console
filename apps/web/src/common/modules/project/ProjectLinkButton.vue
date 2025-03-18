<script setup lang="ts">
import { computed } from 'vue';
import type { Location } from 'vue-router/types/router';

import {
    PTextButton, PI, PLink, PSkeleton,
} from '@cloudforet/mirinae';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';


import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';

const props = defineProps<{
    projectId: string;
    to?: Location;
    useClickEvent?: boolean;
    noRoleIfNotExists?: boolean;
}>();
const emit = defineEmits<{(event: 'click'): void;
}>();
const projectReferenceStore = useProjectReferenceStore();
const userWorkspaceStore = useUserWorkspaceStore();

const hasProjectReferenceLoaded = computed<boolean>(() => !!projectReferenceStore.getters.projectItems);
const projectPageLocation = computed<Location>(() => ({
    name: PROJECT_ROUTE_V1.DETAIL._NAME,
    params: {
        workspaceId: userWorkspaceStore.getters.currentWorkspaceId as string,
        id: props.projectId,
    },
}));
const getProjectName = (projectId: string): string|undefined => projectReferenceStore.getters.projectItems[projectId]?.label;
</script>

<template>
    <span>
        <template v-if="hasProjectReferenceLoaded">
            <template v-if="props.noRoleIfNotExists ? !!getProjectName(props.projectId) : true">
                <p-link v-if="!props.useClickEvent"
                        action-icon="internal-link"
                        new-tab
                        :to="props.to || projectPageLocation"
                >
                    {{ getProjectName(props.projectId) || props.projectId }}
                </p-link>
                <p-text-button v-else
                               class="text-gray-900"
                               size="md"
                               @click="emit('click')"
                >
                    <span>
                        {{ getProjectName(props.projectId) || props.projectId }}
                        <p-i name="ic_arrow-right-up"
                             class="link-mark"
                             height="0.875rem"
                             width="0.875rem"
                             color="inherit"
                        />
                    </span>
                </p-text-button>
            </template>
            <template v-else>
                {{ $t('COMMON.PROJECT_LINK_BUTTON.NO_ROLE') }}
            </template>
        </template>
        <p-skeleton v-else
                    width="100%"
        />
    </span>
</template>

