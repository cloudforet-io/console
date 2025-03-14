<script lang="ts" setup>
import { useElementBounding } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PSelectDropdown } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface Props {
    projectId?: string;
    users?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    projectId: '',
    users: () => [],
});

const dropdownRef = ref<HTMLElement | null>(null);

const { top } = useElementBounding(dropdownRef);

const emit = defineEmits<{(e: 'change', member: string[]): void; }>();

const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    userId: computed<string|undefined>(() => userStore.state.userId),
});
const state = reactive({
    loading: true,
    targetProject: null as ProjectModel|null,
    projectMemberIdList: computed<string[]>(() => {
        if (!state.targetProject) return [];
        if (state.targetProject.project_type === 'PUBLIC') return Object.keys(storeState.users);
        const _users = new Set([storeState.userId, ...(state.targetProject.users ?? [])]);
        return [..._users];
    }),
    allMemberItems: computed<SelectDropdownMenuItem[]>(() => state.projectMemberIdList.map((d) => ({
        name: d,
        label: storeState.users[d]?.label ?? d,
        type: 'item',
    }))),
    selectedMemberItems: props.users.map((d) => ({ name: d, label: d })),
    workspaceUsers: [] as WorkspaceUserModel[],
    visibleMenu: false,
});

const emitChange = () => {
    emit('change', state.selectedMemberItems.map((d) => d.name));
};

/* Api */
const getProject = async (): Promise<ProjectModel|null> => {
    try {
        state.loading = true;
        return await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
            project_id: props.projectId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    } finally {
        state.loading = false;
    }
};
const listWorkspaceUsers = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>();
        state.workspaceUsers = (results || []).map((i) => ({
            label: i.user_id,
            name: i.user_id,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

(async () => {
    state.targetProject = await getProject();
    await listWorkspaceUsers();
})();

watch(() => top.value, () => {
    state.visibleMenu = false;
}, { immediate: true });
watch(() => state.selectedMemberItems, () => {
    emitChange();
});
</script>

<template>
    <div ref="dropdownRef">
        <p-select-dropdown class="add-notification-member-group"
                           :loading="state.loading"
                           :menu="state.workspaceUsers"
                           :visible-menu.sync="state.visibleMenu"
                           :selected.sync="state.selectedMemberItems"
                           multi-selectable
                           appearance-type="stack"
                           use-fixed-menu-style
                           is-filterable
                           show-delete-all-button
        />
    </div>
</template>

<style lang="postcss" scoped>
.add-notification-member-group {
    max-width: 30rem;
    margin-top: 0.5rem;
}
.tag-menu-item {
    @apply w-full;
}
</style>
