<template>
    <div class="p-query-search-bar">
        <p-autocomplete-search :search-text.sync="proxySearchText" />
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/components/utils/composition';
import { querySearchProps } from '@/components/organisms/search/query-search-bar-new/PQuerySearch.toolset';

// regx

export default {
    name: 'PQuerySearch',
    components: { PAutocompleteSearch },
    model: {
        prop: 'searchText',
        event: 'update:searchText',
    },
    props: querySearchProps,
    setup(props, { emit }) {
        const state = reactive({
            proxySearchText: makeProxy('searchText', props, emit),
        });
        return {
            ...toRefs(state),
        };
    },
};

</script>

<style lang="postcss" scoped>
</style>
