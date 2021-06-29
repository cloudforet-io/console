<template>
    <div class="search-or-select-user">
        <p-autocomplete-search v-model="search"
                               :menu="userItems"
                               @select-menu="onSelectUser"
        >
            <template #menu-item--format="{item, id}">
                <p-check-box v-if="multiSelect"
                             :id="id"
                             v-model="proxySelectedUsers"
                             :value="item.name"
                >
                    {{ nameFormatter(item.name) }}
                </p-check-box>
                <p-radio v-else
                         v-model="proxySelectedUsers"
                         :value="item.name"
                >
                    {{ nameFormatter(item.name) }}
                </p-radio>
            </template>
            <template #menu-no-data-format>
                <div v-if="!users.length" class="fake-no-data" />
            </template>
        </p-autocomplete-search>
        <div v-if="proxySelectedUsers.length" class="tag-box">
            <p-tag v-for="(tag, i) in proxySelectedUsers" :key="tag" @delete="onDeleteTag(i)">
                {{ nameFormatter(tag) }}
            </p-tag>
        </div>
    </div>
</template>

<script lang="ts">
import {
    PAutocompleteSearch, PTag, PCheckBox, PRadio,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import { store } from '@/store';


export default {
    name: 'SearchOrSelectUser',
    components: {
        PAutocompleteSearch,
        PTag,
        PCheckBox,
        PRadio,
    },
    props: {
        multiSelect: {
            type: Boolean,
            default: true,
        },
        selectedUsers: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            search: '',
            users: computed(() => store.state.resource.user.items),
            userItems: computed(() => Object.keys(state.users).map(k => ({
                name: k,
                label: state.users[k]?.name,
            }))),
            proxySelectedUsers: makeProxy('selectedUsers', props, emit),
        });

        /* util */
        const nameFormatter = (userId) => {
            const userName = state.users[userId].name;
            if (userName) return `${userId} (${userName})`;
            return userId;
        };

        /* event */
        const onSelectUser = async (item: MenuItem) => {
            state.search = '';
            if (props.multiSelect) {
                const idx = state.proxySelectedUsers.findIndex(k => k === item.name);
                if (idx === -1) {
                    state.proxySelectedUsers.push(item.name);
                }
            } else {
                state.proxySelectedUsers = [item.name];
            }
        };
        const onDeleteTag = async (idx) => {
            await state.proxySelectedUsers.splice(idx, 1);
            state.proxySelectedUsers = [...state.proxySelectedUsers];
        };

        return {
            ...toRefs(state),
            onSelectUser,
            onDeleteTag,
            nameFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
