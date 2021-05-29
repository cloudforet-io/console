<template>
    <fragment>
        <p-autocomplete-search v-model="search" :menu="allMemberItems" :loading="loading"
                               class="autocomplete-search" @select-menu="onSelectMember"
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
    </fragment>
</template>

<script lang="ts">
import { PAutocompleteSearch, PCheckBox } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

export default {
    name: 'AddNotificationMemberGroup',
    components: {
        PAutocompleteSearch, PCheckBox,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            search: '',
            loading: true,
            allMember: [] as string[],
            allMemberItems: computed(() => state.allMember.map(d => ({
                name: d.resource_id,
                label: d.resource_id,
                type: 'item',
            }))),
            selectedMemberItems: [],
        });

        const onSelectMember = (item: MenuItem) => {
            state.search = '';
            // const idx = state.selectedMemberItems.findIndex(k => k === item.name);
            state.selectedMemberItems = [...state.selectedMemberItems, item.name];
        };

        (async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.project.member.list({
                    project_id: props.projectId,
                });
                state.allMember = res.results;
            } catch (e) {
                state.allMember = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        })();
        return {
            ...toRefs(state),
            onSelectMember,
        };
    },
};
</script>

<style lang="postcss" scoped>
.autocomplete-search {
    max-width: 26.25rem;
}
</style>
