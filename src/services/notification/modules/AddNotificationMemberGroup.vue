<template>
    <p-search-dropdown class="add-notification-member-group"
                       type="checkbox"
                       :loading="loading"
                       :menu="allMemberItems"
                       :selected.sync="selectedMemberItems"
                       use-fixed-menu-style
    />
</template>

<script lang="ts">
import {
    PSearchDropdown,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'AddNotificationMemberGroup',
    components: {
        PSearchDropdown,
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
            allMemberItems: computed(() => {
                const userItems = state.userItems;
                return state.allMember.map(d => ({
                    name: d.resource_id,
                    label: userItems[d.resource_id]?.label,
                    type: 'item',
                }));
            }),
            selectedMemberItems: props.users.map(d => ({ name: d, label: d })),
            userItems: computed(() => store.state.resource.user.items),
        });

        const emitChange = () => {
            emit('change', {
                users: state.selectedMemberItems.map(d => d.name),
            });
        };

        const removeDuplicatedElement = (duplicatedArr) => {
            const res = duplicatedArr.filter((item, i) => (
                duplicatedArr.findIndex(item2 => item.resource_id === item2.resource_id) === i
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
            await Promise.all([store.dispatch('resource/user/load'), listProjectMember()]);
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
