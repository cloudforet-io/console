import PQuerySearchTags from './QuerySearchTags.vue';
import { TagToolSet } from '@/components/molecules/tags/toolset';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

export default {
    title: 'organisms/search/query-search-tags',
    component: PQuerySearchTags,
};


export const defaultCase = () => ({
    components: { PQuerySearchTags },
    template: '<div style="width: 80vw"><PQuerySearchTags :tags="ts.tags.value" @deleteTag="ts.deleteTag" @deleteAllTags="ts.deleteAllTags"/></div>',
    setup(props, context) {
        const ts = new TagToolSet();
        ts.tags.value = [new SearchQuery('test', '', 'not me'), new SearchQuery('hellow', '', 'not me')];
        return {
            ts,
        };
    },
});
