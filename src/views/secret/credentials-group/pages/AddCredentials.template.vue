<template>
    <div class="addCdg">
        <p-pane-layout class="add-cdg-container">
            <p>
                Add Credentials
            </p>
            <p-toolbox-table
                ref="toolbox"
                :items="items"
                :fields="fields"
                :selectable="true"
                :sortable="true"
                :dragable="true"
                :hover="true"
                :shadow="false"
                :border="false"
                :responsive="true"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :all-page="allPage"
                :this-page.sync="thisPage"
                :select-index.sync="selectIndex"
                :page-size.sync="pageSize"
                :setting-visible="false"
                :loading="loading"
                :use-spinner-loading="true"
                :use-cursor-loading="true"
                @changePageSize="getCd"
                @changePageNumber="getCd"
                @clickRefresh="getCd"
                @changeSort="getCd"
            >
                <template slot="toolbox-left">
                    <div class="left-toolbox-item">
                        <p-search :search-text.sync="searchText" @onSearch="getCd" />
                    </div>
                </template>
            </p-toolbox-table>
            <p-box-layout class="tag-container">
                <p-tag v-for="(tag, idx) in tagTools.tags" :key="`tag-${tag}`"
                       <p-tag
                       @delete="tagTools.deleteTag(idx)"
                />
            </p-box-layout>
            <p-row>
                <p-button class="cancel-btn" style-type="dark" outline
                          @click="clickCreate"
                >
                    {{ tr('COMMON.BTN_CANCEL') }}
                </p-button>

                <p-button class="ok-btn" style-type="primary" @click="clickCreate">
                    {{ tr('COMMON.BTN_OK') }}
                </p-button>
            </p-row>
        </p-pane-layout>
    </div>
</template>
<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import { timestampFormatter, getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import PButton from '@/components/atoms/buttons/Button.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import PCdData from '@/views/secret/credentials-group/pages/AddCredentials.vue';
import PBoxLayout from '@/components/molecules/layouts/box-layout/BoxLayout.vue';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';

export const CdTableReactive = parent => reactive({
    fields: makeTrItems([
        ['credentials_id', 'COMMON.ID'],
        ['name', 'COMMON.NAME'],
        ['created_at', 'COMMON.CREATE'],
    ],
    parent),
    selectIndex: [],
    items: [],
    searchText: '',
    loading: false,
    toolbox: null, // template refs
    tagTools: tagList(),
});
export const eventNames = {
    tagResetEvent: '',
    tagConfirmEvent: '',
    getCdList: '',
    getCdData: '',
};

export const cdgSetup = (props, context, eventName) => {
    const eventBus = cdgEventBus;
    const tableState = CdTableReactive(context.parent);
    const tags = ref({});
    const state = requestToolboxTableMetaReactive();
    const getCd = () => {
        eventBus.$emit(eventName.getCdList);
    };
    const sortSelectIndex = computed(() => {
        const idxs = [...tableState.selectIndex];
        idxs.sort((a, b) => a - b);
        return idxs;
    });
    const isNotSelected = computed(() => tableState.selectIndex.length === 0);
    const isNotOnlyOneSelected = computed(() => tableState.selectIndex.length !== 1);

    const getSelectedCdItems = computed(() => {
        const items = [];
        sortSelectIndex.value.forEach((idx) => {
            items.push(tableState.items[idx]);
        });
        return items;
    });
    const getSelectedCdIds = computed(() => {
        const ids = [];
        getSelectedCdItems.value.forEach((item) => {
            ids.push(item.credential_id);
        });
        return ids;
    });
    const getFirstSelectedCdId = computed(() => (getSelectedCdIds.value.length >= 1 ? getSelectedCdIds[0] : ''));

    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        tags,
        timestampFormatter,
        getCd,
        ...eventName,
        getSelectedCdItems,
        getSelectedCdIds,
        getFirstSelectedCdId,
    });
};
export default {
    name: 'AddCdgTemplate',
    filters: {
        getValue,
    },
    components: {
        PPaneLayout,
        PToolboxTable,
        PButton,
        PCdData,
        PSearch,
        PBoxLayout,
        PRow,
        PCol,
    },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = cdgSetup(props, context, eventNames);
        state.getCd();

        return {
            ...toRefs(state),
            ...toRefs(dataBind),
            getCd: () => {
                cdgEventBus.$emit(eventNames.getCdList);
                console.log(eventNames.getCdList);
            },
        };
    },
};
</script>

<style lang="scss" scoped>
    .add-cdg-container {
        padding: 1rem;
    }
    
    .toolbox-table {
        padding: 0px;
    }

    .cancel-btn {
        margin-right: auto;
    }


    .addCdg{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }
    .tag-container {
        min-height: 80px;
    }
</style>
