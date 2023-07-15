<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFilterableDropdown,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useStore } from 'vuex';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    projectId: string;
    users: string[];
}

const props = withDefaults(defineProps<Props>(), {
    projectId: '',
    users: () => [],
});
const emit = defineEmits<{(e: 'change', value: { users: string }): void}>();
const store = useStore();

const state = reactive({
    loading: true,
    allMember: [] as any[],
    allMemberItems: computed(() => state.allMember.map((d) => ({
        name: d.resource_id,
        label: state.users[d.resource_id]?.label,
        type: 'item',
    }))),
    selectedMemberItems: props.users.map((d) => ({ name: d, label: d })),
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
});

const emitChange = () => {
    emit('change', {
        users: state.selectedMemberItems.map((d) => d.name),
    });
};

const removeDuplicatedElement = (duplicatedArr) => {
    const res = duplicatedArr.filter((item, i) => (
        duplicatedArr.findIndex((item2) => item.resource_id === item2.resource_id) === i
    ));
    return res;
};

const listProjectMember = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.client.identity.project.member.list({
            project_id: props.projectId,
            include_parent_member: true,
        });
        state.allMember = removeDuplicatedElement(results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.allMember = [];
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
    <p-filterable-dropdown v-model:selected="state.selectedMemberItems"
                           class="add-notification-member-group"
                           :loading="state.loading"
                           :menu="state.allMemberItems"
                           multi-selectable
                           appearance-type="stack"
                           use-fixed-menu-style
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
