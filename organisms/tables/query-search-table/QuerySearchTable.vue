<template>
    <div>
        <p-toolbox-table
            class="p-query-search-table"
            :striped="false"
            hover
            :setting-visible="false"
            :fields="fields"
            :items="items"
            :all-page="allPage"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :select-index.sync="selectIndex"
            :loading.sync="loading"
            :this-page.sync="thisPage"
            :page-size.sync="pageSize"
            :responsive-style="responsiveStyle"
            use-cursor-loading
            v-on="$listeners"
        >
            >
            <template #toolbox-top>
                <slot name="toolbox-top">
                    <!--                    <p-panel-top v-if="showTitle"-->
                    <!--                                 style="margin: 0; margin-top: 0.5rem;"-->
                    <!--                                 use-total-count-->
                    <!--                                 :total-count="totalCount"-->
                    <!--                    >-->
                    <!--                        {{ title }}-->
                    <!--                    </p-panel-top>-->
                </slot>
            </template>
            <template #toolbox-left>
                <slot name="toolbox-left" />
                <div class="left-toolbox-item hidden lg:block">
                    <p-query-search v-model="proxySearchText"
                                    v-bind="querySearch.state"
                                    @menu:show="querySearch.onMenuShow"
                                    @key:input="querySearch.onKeyInput"
                                    @value:input="querySearch.onValueInput"
                                    @key:select="querySearch.onKeySelect"
                                    @search="querySearch.onSearch"
                    />
                </div>
            </template>
            <template #toolbox-bottom>
                <div class="flex flex-col flex-1">
                    <p-query-search v-model="proxySearchText"
                                    class="block lg:hidden mt-4"
                                    :class="{ 'mb-4':!!$scopedSlots['toolbox-bottom']&&querySearch.tags.length===0}"
                                    v-bind="querySearch.state"
                                    @menu:show="querySearch.onMenuShow"
                                    @key:input="querySearch.onKeyInput"
                                    @value:input="querySearch.onValueInput"
                                    @key:select="querySearch.onKeySelect"
                                    @search="querySearch.onSearch"
                    />
                    <div v-if="querySearch.tags.length !==0" class="mt-4"
                         :class="{'tb-bottom':$scopedSlots['toolbox-bottom']}"
                    >
                        <p-hr style="width: 100%;" />
                        <p-query-search-tags style="margin-top: 0.5rem;"
                                             :tags="querySearch.tags"
                                             @delete:tag="querySearch.deleteTag"
                                             @delete:all="querySearch.deleteAllTags"
                        />
                    </div>
                    <slot name="toolbox-bottom" />
                </div>
            </template>
            <template v-for="slot of slots" v-slot:[slot.name]="data">
                <slot :name="slot.name" v-bind="data" />
            </template>
        </p-toolbox-table>
    </div>
</template>

<script lang="ts">

import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop_origin.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/components/utils/composition';
import { QuerySearchToolSet } from '@/components/organisms/search/query-search/PQuerySearch.toolset';
import { defaultACHandler } from '@/lib/api/query-search';
import { querySearchTableProps } from './QuerySearchTable.toolset';

export default {
    name: 'PQuerySearchTable',
    components: { PQuerySearch, PToolboxTable },
    props: querySearchTableProps,
    setup(props, { emit }) {
        const state = reactive({
            allPage: computed(() => Math.ceil(props.totalCount / props.pageSize)),
            proxySearchText: makeProxy('searchText', props, emit),
        });

        const querySearch = new QuerySearchToolSet(
            defaultACHandler.keyHandler,
            defaultACHandler.valueHandlerMap,
            defaultACHandler.suggestKeys,
            props.searchTags,
        );
        return { ...toRefs(state), querySearch };
    },
};
</script>

<style lang="postcss" scoped>
.tb-bottom {
    @apply mb-4;
}
</style>
