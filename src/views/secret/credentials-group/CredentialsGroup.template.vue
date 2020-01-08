<template>
    <div class="credentialsGroup">
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
                    @changePageSize="getCredentialsGroup"
                    @changePageNumber="getCredentialsGroup"
                    @clickRefresh="getCredentialsGroup"
                    @changeSort="getCredentialsGroup"
                >
                    <!--                    <template slot="toolbox-left">-->
                    <!--                        <p-button style-type="primary" @click="clickAdd">-->
                    <!--                            {{ tr('COMMON.BTN_ADD') }}-->
                    <!--                        </p-button>-->
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
                    <!--                            <p-search :search-text.sync="searchText" @onSearch="getCredentialGroups" />-->
                    <!--                        </div>-->
                    <!--                    </template>-->
                    <!--                    <template v-slot:col-state-format="{value}">-->
                    <!--                        <p-status v-bind="credentialGroupStateFormatter(value)" />-->
                    <!--                    </template>-->
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <!--        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">-->
        <!--            <template #detail="{tabName}">-->
        <!--                <p-credential-group-detail ref="credentialGroupDetail"-->
        <!--                                           :item="items[selectIndex[0]]"-->
        <!--                                           :tag-confirm-event="tagConfirmEvent"-->
        <!--                                           :tag-reset-event="tagResetEvent"-->
        <!--                />-->
        <!--            </template>-->
        <!--            <template #credentials="{tabName}">-->
        <!--                <p-credential-group-data-->

        <!--                />-->
        <!--            </template>-->
        <!--        </PTab>-->
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue, userStateFormatter } from '@/lib/util';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import grpEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { makeTrItems } from '@/lib/view-helper';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';

export const CGPTableReactive = parent => reactive({
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
    getCredentialsGroupList: '',
    addCredentialsGroup: '',
    deleteCredentialsGroup: '',
    updateCredentialsGroup: '',
};

export const credentialsGroupSetup = (props, context, eventName) => {
    const eventBus = grpEventBus;
    const tableState = CGPTableReactive(context.parent);
    const state = requestToolboxTableMetaReactive();

    const getCredentialsGroup = () => {
        console.log('credentialsGroup event');
        eventBus.$emit(eventName.getCredentialsGroup);
    };
    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        getCredentialsGroup,
    });
};
export default {
    name: 'CredentialGroup',
    components: { PToolboxTable, PHorizontalLayout },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = credentialsGroupSetup(props, context, dataBind.items);

        return {
            ...toRefs(state),
            ...toRefs(dataBind),
        };
    },
};
</script>

<style scoped>

</style>
