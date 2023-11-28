<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGetRequestParams } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

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

const storeState = reactive({
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
});
const state = reactive({
    loading: true,
    projectUserIdList: [] as string[],
    allMemberItems: computed<SelectDropdownMenuItem[]>(() => state.projectUserIdList.map((d) => ({
        name: d,
        label: storeState.users[d]?.name ?? d,
        type: 'item',
    }))),
    selectedMemberItems: props.users.map((d) => ({ name: d, label: d })),
});

const emitChange = () => {
    emit('change', {
        users: state.selectedMemberItems.map((d) => d.name),
    });
};

const listProjectMember = async () => {
    state.loading = true;
    try {
        const params: ProjectGetRequestParams = {
            project_id: props.projectId,
        };
        const res: ProjectModel = await SpaceConnector.clientV2.identity.project.get(params);
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
        // LOAD REFERENCE STORE
        store.dispatch('reference/user/load'),
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
