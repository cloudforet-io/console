<template>
    <div class="search-or-select-user">
        <p-autocomplete-search v-model="search"
                               :loading="loading"
                               :menu="userItems"
                               @select-menu="onSelectMember"
        >
            <template #menu-item--format="{item, id}">
                <p-check-box v-if="multiSelect"
                             :id="id"
                             v-model="proxySelectedUsers"
                             :value="item.name"
                >
                    {{ nameFormatter(item) }}
                </p-check-box>
                <p-radio v-else
                         v-model="proxySelectedUsers"
                         :value="item.name"
                >
                    {{ nameFormatter(item) }}
                </p-radio>
            </template>
            <template #menu-no-data-format>
                <div v-if="loading" class="fake-no-data" />
            </template>
        </p-autocomplete-search>
        <div v-if="proxySelectedUsers.length" class="tag-box">
            <p-tag v-for="(tag, i) in proxySelectedUsers" :key="tag" @delete="onDeleteTag(i)">
                {{ tag ? tag : '' }}
            </p-tag>
        </div>
    </div>
</template>

<script lang="ts">
import {
    PAutocompleteSearch, PTag, PCheckBox, PRadio,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { SpaceConnector } from '@/lib/space-connector';
import { makeProxy } from '@/lib/compostion-util';

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
            loading: true,
            search: '',
            users: [] as string[],
            userItems: computed(() => state.users.map(d => ({
                name: d.user_id,
                label: d.name,
                type: 'item',
            }))),
            proxySelectedUsers: makeProxy('selectedUsers', props, emit),
        });

        /* api */
        const listMember = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.user.list();
                state.users = res.results;
            } catch (e) {
                state.users = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* util */
        const nameFormatter = (item) => {
            let result = item.name;
            if (item.label) {
                result += ` (${item.label})`;
            }
            return result;
        };

        /* event */
        const onSelectMember = async (item: MenuItem) => {
            state.search = '';
            state.proxySelectedUsers = [...state.proxySelectedUsers, item.name];
        };
        const onDeleteTag = async (idx) => {
            await state.proxySelectedUsers.splice(idx, 1);
            state.proxySelectedUsers = [...state.proxySelectedUsers];
        };

        (async () => {
            await listMember();
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
.tag-box {
    @apply text-gray-900;
    margin-top: 0.625rem;
    .p-tag {
        margin-bottom: 0.5rem;
    }
}
</style>
