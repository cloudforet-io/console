<template>
    <p-filterable-dropdown class="add-notification-member-group"
                           :loading="loading"
                           :menu="allMemberItems"
                           :selected.sync="selectedMemberItems"
                           multi-selectable
                           appearance-type="stack"
                           use-fixed-menu-style
    />
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PFilterableDropdown,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'AddNotificationMemberGroup',
    components: {
        PFilterableDropdown,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        users: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit }) {
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

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.add-notification-member-group {
    max-width: 30rem;
}
.tag-menu-item {
    @apply w-full;
}
</style>
