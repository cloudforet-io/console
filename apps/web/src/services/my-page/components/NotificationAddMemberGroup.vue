<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
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
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
    userId: computed<string>(() => store.state.user.userId),
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
});

const emitChange = () => {
    emit('change', {
        users: state.selectedMemberItems.map((d) => d.name),
    });
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
(async () => {
    state.targetProject = await getProject();
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
