<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    projectId?: string;
    users?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    projectId: '',
    users: () => [],
});

const emit = defineEmits<{(e: 'change', value: any): void; }>();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
});
const state = reactive({
    loading: true,
    projectUserIdList: [] as string[],
    allMemberItems: computed<SelectDropdownMenuItem[]>(() => state.projectUserIdList.map((d) => ({
        name: d,
        label: storeState.users[d]?.label ?? d,
        type: 'item',
    }))),
    selectedMemberItems: props.users.map((d) => ({ name: d, label: d })),
});

const emitChange = () => {
    emit('change', {
        users: state.selectedMemberItems.map((d) => d.name),
    });
};

const fetchWorkspaceUserList = async () => {
    try {
        const res = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>({
        });
        state.projectUserIdList = res.results?.map((d) => d.user_id) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
    }
};
const listProjectMember = async () => {
    try {
        state.loading = true;
        const res = await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
            project_id: props.projectId,
        });
        if (res.project_type === 'PUBLIC') {
            await fetchWorkspaceUserList();
            return;
        }
        state.projectUserIdList = res.users ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
    } finally {
        state.loading = false;
    }
};
(async () => {
    await Promise.allSettled([
        listProjectMember(),
    ]);
})();

watch(() => state.selectedMemberItems, () => {
    emitChange();
});
</script>

<template>
    <p-select-dropdown class="add-notification-member-group"
                       :loading="state.loading"
                       :menu="state.allMemberItems"
                       :selected.sync="state.selectedMemberItems"
                       multi-selectable
                       appearance-type="stack"
                       use-fixed-menu-style
                       is-filterable
                       show-delete-all-button
    />
</template>

<style lang="postcss" scoped>
.add-notification-member-group {
    max-width: 30rem;
}
.tag-menu-item {
    @apply w-full;
}
</style>
