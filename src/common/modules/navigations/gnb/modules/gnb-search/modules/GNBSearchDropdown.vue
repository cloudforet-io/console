<template>
    <p-data-loader :data="allSelectableItems"
                   :loading="loading"
                   class="gnb-search-dropdown"
    >
        <template #loader>
            <div class="skeleton-wrapper">
                <p-skeleton width="36%" height="1rem" class="mb-2" />
                <p-skeleton width="100%" height="2rem" />
            </div>
        </template>
        <g-n-b-search-suggestion-list :items="suggestionItems"
                                      :input-text="inputText"
        />
        <template #no-data>
            <div v-if="inputText" class="no-data">
                <img src="@/assets/images/illust_ghost.svg" class="no-data-img">
                <p class="no-data-text">
                    Search for navigation menus or cloud services.
                </p>
            </div>
            <div v-else class="no-data">
                <img src="@/assets/images/illust_microscope.svg" class="no-data-img">
                <p class="no-data-text">
                    No result found for "<em>search keyword</em>" <br>Try again with different term.
                </p>
            </div>
        </template>
    </p-data-loader>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, PropType,
    reactive, toRefs,
} from '@vue/composition-api';
import GNBSearchSuggestionList, { Item as SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchSuggestionList.vue';
import { PDataLoader, PDivider, PSkeleton } from '@spaceone/design-system';

interface Props {
    inputText: string;
    loading: boolean;
    // TODO: declare types of menuList and cloudServiceList
    menuList: any[];
    cloudServiceList: any[];
}

export default defineComponent<Props>({
    name: 'GNBSearchDropdown',
    components: {
        GNBSearchSuggestionList,
        PDivider,
        PDataLoader,
        PSkeleton,
    },
    props: {
        inputText: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        menuList: {
            type: Array as PropType<any[]>,
            default: () => [],
        },
        cloudServiceList: {
            type: Array as PropType<any[]>,
            default: () => [],
        },
    },
    setup(props) {
        const state = reactive({
            menuItems: [
                { name: 'project', label: 'Project' },
                { name: 'cost_explorer', label: 'Cost Explorer', parents: [{ name: 'dashboard', label: 'Dashboard' }] },
            ] as SuggestionItem[],
            cloudServiceItems: computed<SuggestionItem[]>(() => props.cloudServiceList.map(d => ({
                name: d.cloud_service_type_id,
                label: d.name,
                icon: d.tags['spaceone:icon'],
                defaultIcon: 'ic_provider_other',
                parents: [{ name: d.group, label: d.group }],
            }))),
            suggestionItems: computed<SuggestionItem[]>(() => [
                { name: 'title', label: 'RECENT SEARCHES MENU', type: 'header' },
                ...state.menuItems,
                { type: 'divider' },
                { name: 'title', label: 'RECENT SEARCHES CLOUD SERVICE', type: 'header' },
                ...state.cloudServiceItems,
            ] as SuggestionItem[]),
            allSelectableItems: computed<any[]>(() => state.menuItems.concat(state.cloudServiceItems)),
        });


        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search-dropdown {
    @apply bg-white;
    width: 27.5rem;
    padding: 0 0.75rem;
    min-height: 14.875rem;
    .skeleton-wrapper {
        @apply flex flex-col w-full self-start;
    }
    .no-data {
        padding: 2.5rem 0;
        .no-data-img {
            @apply ml-auto mr-auto;
        }
        .no-data-text {
            margin-top: 1.5rem;
            font-size: 0.875rem;
            em {
                @apply font-bold;
            }
        }
    }
}
</style>
