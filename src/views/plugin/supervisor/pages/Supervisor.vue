<template>
    <general-page-layout>
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-dynamic-view view_type="query-search-table"
                                :api-handler="mainTableTS"
                                :data_source="[{name:'id'}]"
                                :vbind="{responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}}"
                                :data="null"
                />
            </template>
        </p-horizontal-layout>
        <!--        <PTab v-if="dvApiHandler.tableTS.selectState.isSelectOne" :tabs="tabs" :active-tab.sync="activeTab">-->
        <!--            <template #detail>-->
        <!--                <PDynamicDetails-->
        <!--                    :details="dvApiHandler.tableTS.selectState.firstSelectItem.metadata.details"-->
        <!--                    :data="dvApiHandler.tableTS.selectState.firstSelectItem"-->
        <!--                />-->
        <!--            </template>-->
        <!--            <template #data>-->
        <!--                <PDynamicSubData-->
        <!--                    :select-id="dvApiHandler.tableTS.selectState.firstSelectItem.cloud_service_id" :sub-data="dvApiHandler.tableTS.selectState.firstSelectItem.metadata.sub_data"-->
        <!--                    url="/inventory/cloud-service/get-data" id-key="cloud_service_id"-->
        <!--                />-->
        <!--            </template>-->
        <!--            <template #rawData>-->
        <!--                <p-raw-data :item="dvApiHandler.tableTS.selectState.firstSelectItem" />-->
        <!--            </template>-->
        <!--        </PTab>-->
        <!--        <PTab v-else-if="dvApiHandler.tableTS.selectState.isSelectMulti" :tabs="multiTabs" :active-tab.sync="activeMultiTab">-->
        <!--            <template #data>-->
        <!--                <p-dynamic-view-->
        <!--                    view_type="simple-table"-->
        <!--                    :data_source="selectTypeDataSource"-->
        <!--                    :data="dvApiHandler.tableTS.selectState.selectItems"-->
        <!--                />-->
        <!--            </template>-->
        <!--        </PTab>-->
        <!--        <p-empty v-else class="header">-->
        <!--            No Selected Item-->
        <!--        </p-empty>-->
    </general-page-layout>
</template>

<script lang="ts">

import { defineComponent } from '@vue/composition-api';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';


import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import { makeTrItems } from '@/lib/view-helper';
import PRawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import VerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { QuerySearchTableToolSet } from '@/components/organisms/tables/toolbox-table/toolset';

export default defineComponent({
    name: 'Supervisor',
    components: {
        VerticalPageLayout,
        PHorizontalLayout,
        PDynamicView,
        PTab,
        PDynamicSubData,
        PButton,
        PRawData,
        PDropdownMenuBtn,
        PHr,
        PQuerySearchTags,
        PDynamicDetails,
        PRow,
        PEmpty,
        SProjectTreeModal,
    },
    setup() {
        const mainTableTS = new QuerySearchTableToolSet();
        return {
            mainTableTS,

        };
    },
});
</script>

<style scoped>

</style>
