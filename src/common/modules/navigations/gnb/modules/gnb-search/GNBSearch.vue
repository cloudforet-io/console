<template>
    <div class="gnb-search">
        <!-- TODO: apply responsive view - laptop, tablet, mobile
        <p-i name="ic_search--bold" />
        -->

        <g-n-b-search-input v-model="inputText"
                            @click.stop="showSuggestion"
                            @keyup.esc="hideSuggestion"
                            @keyup.down="showSuggestion"
        />

        <!-- TODO: Split the code below into GNBSearchDropdown component -->
        <p-data-loader v-if="visibleSuggestion"
                       :data="allSuggestionItems"
                       :loading="loading"
        >
            <template #loader>
                <div class="skeleton-wrapper">
                    <p-skeleton width="36%" height="1rem" class="mb-2" />
                    <p-skeleton width="100%" height="2rem" />
                </div>
            </template>
            <g-n-b-search-suggestion-list title="recent searches menu"
                                          :items="menuItems"
                                          :input-text="inputText"
            />
            <p-divider />
            <g-n-b-search-suggestion-list title="recent searches cloud service"
                                          :items="cloudServiceItems"
                                          :input-text="inputText"
                                          show-icon
                                          default-icon="ic_provider_other"
            />
            <template #no-data>
                <div v-if="trimmedInputText" class="no-data">
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
    </div>
</template>

<script lang="ts">
import {
    computed, onMounted, onUnmounted,
    reactive, toRefs,
} from '@vue/composition-api';
import {
    PDataLoader, PDivider, PSkeleton,
} from '@spaceone/design-system';
import GNBSearchSuggestionList, { Item as SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchSuggestionList.vue';
import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchInput.vue';

export default {
    name: 'GNBSearch',
    components: {
        GNBSearchInput,
        GNBSearchSuggestionList,
        PDivider,
        PDataLoader,
        // PI,
        PSkeleton,
    },
    setup() {
        const state = reactive({
            visibleSuggestion: false,
            inputText: '',
            trimmedInputText: computed<string>(() => {
                if (state.inputText) return state.inputText.trim();
                return '';
            }),
            loading: false,
            menuItems: [
                { name: 'project', label: 'Project' },
                { name: 'cost_explorer', label: 'Cost Explorer', parents: [{ name: 'dashboard', label: 'Dashboard' }] },
            ] as SuggestionItem[],
            cloudServiceItems: [
                { name: 'lambda', label: 'Lambda', icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/cloud-services/aws/AWS-Lambda.svg' },
                {
                    name: 'ec2',
                    label: 'EC2',
                    icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws-ec2.svg',
                    parents: [{ name: 'instance', label: 'Instance' }],
                },
            ] as SuggestionItem[],
            allSuggestionItems: computed<SuggestionItem[]>(() => state.menuItems.concat(state.cloudServiceItems)),
        });

        const showSuggestion = () => {
            state.visibleSuggestion = true;
        };

        const hideSuggestion = () => {
            state.visibleSuggestion = false;
        };

        onMounted(() => {
            window.addEventListener('click', hideSuggestion);
            window.addEventListener('blur', hideSuggestion);
        });
        onUnmounted(() => {
            window.removeEventListener('click', hideSuggestion);
            window.removeEventListener('blur', hideSuggestion);
        });

        return {
            ...toRefs(state),
            showSuggestion,
            hideSuggestion,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-search {
    /* TODO */
    .p-data-loader {
        @apply bg-white;
        width: 27.5rem;
        padding: 0 0.75rem;
        min-height: 14.875rem;
    }
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
