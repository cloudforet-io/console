<template>
    <div class="cdg">
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :dragable="true"
                    :hover="true"
                    :responsive="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectIndex"
                    :page-size.sync="pageSize"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}"
                    :setting-visible="false"
                    :loading="loading"
                    :use-spinner-loading="true"
                    :use-cursor-loading="true"
                    @changePageSize="getCdg"
                    @changePageNumber="getCdg"
                    @clickRefresh="getCdg"
                    @changeSort="getCdg"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary">
                            {{ tr('COMMON.BTN_CRT') }}
                        </p-button>
                        <!--                        <PDropdownMenuBtn-->
                        <!--                            id="server-dropdown-btn"-->
                        <!--                            class="left-toolbox-item"-->
                        <!--                            :menu="dropdown"-->
                        <!--                            @click-enable="clickEnable"-->
                        <!--                            @click-disable="clickDisable"-->
                        <!--                            @click-delete="clickDelete"-->
                        <!--                            @click-update="clickUpdate"-->
                        <!--                        >-->
                        <!--                            Action-->
                        <!--                        </PDropdownMenuBtn>-->
                        <!--                        <div class="left-toolbox-item">-->
                        <!--                            <p-search :search-text.sync="searchText" @onSearch="getCdg" />-->
                        <!--                        </div>-->
                        <!--                    </template>-->
                        <!--                    <template v-slot:col-state-format="{value}">-->
                        <!--                        <p-status v-bind="cdgStateFormatter(value)" />-->
                        <!--                    </template>-->
                        <!--                </p-toolbox-table>-->
                        <!--            </template>-->
                        <!--        </p-horizontal-layout>-->
                        <!--        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">-->
                        <!--            <template #detail="{tabName}">-->
                        <!--                <p-cdg-detail ref="cdgDetail"-->
                        <!--                              :item="items[selectIndex[0]]"-->
                        <!--                              :tag-confirm-event="tagConfirmEvent"-->
                        <!--                              :tag-reset-event="tagResetEvent"-->
                        <!--                />-->
                        <!--            </template>-->
                        <!--            <template #credentials="{tabName}">-->
                        <!--                <p-cdg-data />-->
                        <!--            </template>-->
                        <!--        </PTab>-->
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue, cdgStateFormatter } from '@/lib/util';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { makeTrItems } from '@/lib/view-helper';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';

export const CdgTableReactive = parent => reactive({
    fields: makeTrItems([
        ['credential_group_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['created', 'COMMON.CREATE'],
    ],
    parent),
    multiSelectFields: makeTrItems([
        ['credential_group_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['created', 'COMMON.CREATE'],
    ],
    parent),
    selectIndex: [],
    items: [],
    searchText: '',
    loading: false,
    toolbox: null, // template refs
});
export const eventNames = {
    tagResetEvent: '',
    tagConfirmEvent: '',
    getCdgList: '',
    addCdg: '',
    deleteCdg: '',
    updateCdg: '',
};

export const cdgSetup = (props, context, eventName) => {
    const eventBus = cdgEventBus;
    const tableState = CdgTableReactive(context.parent);

    const state = requestToolboxTableMetaReactive();

    const getCdg = () => {
        console.log('credentialsGroup event');
        eventBus.$emit(eventName.getCdgList);
    };

    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        getCdg,
        ...eventNames,
    });
};
export default {
    name: 'CdgTemplate',
    components: { PToolboxTable, PHorizontalLayout },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = cdgSetup(props, context, dataBind.items);

        return {
            ...toRefs(state),
            ...toRefs(dataBind),
        };
    },
};
</script>

<style scoped>

</style>
