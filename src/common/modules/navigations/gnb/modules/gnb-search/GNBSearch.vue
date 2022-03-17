<template>
    <div class="gnb-search">
        <!-- TODO: apply responsive view - laptop, tablet, mobile
        <p-i name="ic_search--bold" />
        -->

        <!-- TODO: Split the code below into GNBSearchInput component -->
        <div>
            <p-i v-if="!inputText"
                 name="ic_search"
                 height="1rem"
                 width="1rem"
            />
            <input v-model="inputText"
                   placeholder="Search..."
                   @focus="showSuggestion = true"
                   @blur="showSuggestion = false"
            >
        </div>

        <!-- TODO: Split the code below into GNBSearchDropdown component -->
        <p-data-loader v-if="showSuggestion"
                       :data="allSuggestionItems"
                       :loading="loading"
        >
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
                <!-- TODO: add markups -->
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';
import { PDataLoader, PDivider, PI } from '@spaceone/design-system';
import GNBSearchSuggestionList, { Item as SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/modules/GNBSearchSuggestionList.vue';

export default {
    name: 'GNBSearch',
    components: {
        GNBSearchSuggestionList,
        PDivider,
        PDataLoader,
        PI,
    },
    setup() {
        const state = reactive({
            showSuggestion: false,
            inputText: '',
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


        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-search {
    /* TODO */
}
</style>
