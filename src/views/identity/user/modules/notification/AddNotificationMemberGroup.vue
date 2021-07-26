<template>
    <fragment>
        <p-autocomplete-search v-model="search" :menu="allMemberItems" :loading="loading"
                               class="autocomplete-search" use-fixed-menu-style
                               @select-menu="onSelectMember"
        >
            <template #menu-item--format="{item, id}">
                <p-check-box :id="id" v-model="selectedMemberItems" class="tag-menu-item"
                             :value="item.name"
                >
                    {{ item.label }}
                </p-check-box>
            </template>
            <template #menu-no-data-format>
                <div v-if="loading" class="fake-no-data" />
            </template>
        </p-autocomplete-search>
        <div class="tag-box">
            <p-tag v-for="(tag, i) in selectedMemberItems" :key="tag" @delete="onDeleteTag(i)">
                {{ tag ? tag : '' }} ({{ userItem[tag].name }})
            </p-tag>
        </div>
    </fragment>
</template>

<script lang="ts">
import { PAutocompleteSearch, PCheckBox, PTag } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import store from '@/store';
import { cloneDeep } from 'lodash';

export default {
    name: 'AddNotificationMemberGroup',
    components: {
        PAutocompleteSearch, PCheckBox, PTag,
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
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            search: '',
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

        const onSelectMember = (item: MenuItem) => {
            state.search = '';
            const idx = state.selectedMemberItems.findIndex(k => k === item.name);
            if (idx === -1) state.selectedMemberItems.push(item.name);
        };

        const onDeleteTag = (idx) => {
            state.selectedMemberItems.splice(idx, 1);
            vm.$nextTick(() => {
                state.selectedMemberItems = [...state.selectedMemberItems];
            });
        };


        const nameFormatter = (userId) => {
            const userName = state.userItem[userId].name;
            if (userName) return `${userId} (${userName})`;
            return userId;
        };

        watch(() => state.selectedMemberItems, () => {
            emitChange();
        });

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
        return {
            ...toRefs(state),
            onSelectMember,
            onDeleteTag,
            nameFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.autocomplete-search {
    max-width: 30rem;
}
.tag-menu-item {
    @apply w-full;
}
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
