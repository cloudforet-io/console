<template>
    <fragment>
        <p-search-dropdown class="add-notification-member-group"
                           type="checkbox"
                           :loading="loading"
                           :menu="allMemberItems"
                           :selected="selectedMemberItems"
                           use-fixed-menu-style
        />
    </fragment>
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
import { cloneDeep } from 'lodash';

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
                const userItems = state.userItem;
                return state.allMember.map((d) => {
                    const userName = userItems[d.resource_id]?.name;
                    return {
                        name: d.resource_id,
                        label: userName ? `${d.resource_id} (${userName})` : d.resource_id,
                        type: 'item',
                    };
                });
            }),
            selectedMemberItems: cloneDeep(props.users) || [],
            userItem: computed(() => store.state.resource.user.items),
        });

        const emitChange = () => {
            emit('change', {
                users: state.selectedMemberItems,
            });
        };

        const removeDuplicatedElement = (duplicatedArr) => {
            const res = duplicatedArr.filter((item, i) => (
                duplicatedArr.findIndex((item2, j) => item.resource_id === item2.resource_id) === i
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
                state.allMember = [];
                console.error(e);
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
