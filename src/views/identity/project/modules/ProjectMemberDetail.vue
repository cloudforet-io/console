<template>
    <div class="animated fadeIn">
        <p-button-modal
            ref="modal"
            :scrollable="true"
            :centered="true"
            :size="'xl'"
            :fade="true"
            :backdrop="true"
            :header-title="getMemberModalTitle"
            :visible.sync="visible"
            @close="close"
            @confirm="confirm"
        >
            <template #body>
                <p-toolbox-table :items="searchedResult"
                                 :responsive-style="{'height': '50vh', 'overflow-y':'auto', 'box-shadow': 'none', 'border':'none'}"
                                 :fields="selectedFields"
                                 :selectable="true"
                                 :sortable="true"
                                 :shadow="false"
                                 :border="false"
                                 :sort-by.sync="tablePage.sortBy"
                                 :sort-desc.sync="tablePage.sortDesc"
                                 :all-page="tablePage.allPage"
                                 :this-page.sync="tablePage.thisPage"
                                 :select-index.sync="selectIndex"
                                 :page-size.sync="tablePage.pageSize"
                >
                    <template slot="toolbox-left">
                        <p-search
                            :search-placeholder="getSearchPlaceHolder"
                            :search-text.sync="searchText"
                            @onSearch="search"
                        />
                    </template>
                    <template v-slot:col-user_id-format="data">
                        {{ data.item.user_info.user_id }}
                    </template>
                    <template v-slot:col-name-format="data">
                        {{ data.item.user_info.name }}
                    </template>
                    <template v-slot:col-email-format="data">
                        {{ data.item.user_info.email }}
                    </template>
                    <template v-slot:col-mobile-format="data">
                        {{ data.item.user_info.mobile }}
                    </template>
                    <template v-slot:col-group-format="data">
                        {{ data.item.user_info.group }}
                    </template>
                    <template v-slot:col-roles-format="data">
                        {{ data.item.user_info.roles }}
                    </template>
                </p-toolbox-table>
            </template>
            <template #close-button>
                {{ tr('COMMON.BTN_CANCEL') }}
            </template>
            <template #confirm-button>
                {{ tr('COMMON.BTN_OK') }}
            </template>
        </p-button-modal>
    </div>
</template>
<script>
import { defaultQuery } from '@/lib/api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PSearch from '@/components/molecules/search/Search';

export default {
    name: 'ProjectMember',
    events: ['close'],
    components: {
        PButtonModal,
        PToolboxTable,
        PSearch,

    },
    data() {
        return {
            visible: false,
            searchedResult: [],
            searchText: null,
            selectable: true,
            sortable: true,
            selectIndex: [],
            tablePage: {
                sortBy: 'name',
                sortDesc: true,
                thisPage: 1,
                allPage: 1,
                pageSize: 15,
            },
        };
    },
    computed: {
        getMemberModalTitle() {
            return this.tr('IDENTITY.ADD_ARG', [this.tr('COMMON.MEMBER')]);
        },
        getSearchPlaceHolder() {
            return this.tr('IDENTITY.SCH_PAC_DT');
        },
        selectedFields() {
            return [
                {
                    name: 'user_id', label: this.tr('COMMON.UID'),
                },
                {
                    name: 'name', label: this.tr('COMMON.NAME'),
                },
                {
                    name: 'email', label: this.tr('COMMON.EMAIL'),
                },
            ];
        },
    },
    mounted() {

    },

    methods: {
        getDefaultQuery() {
            return {
                query: defaultQuery(
                    this.tablePage.thisPage,
                    this.tablePage.pageSize,
                    this.tablePage.sortBy,
                    this.tablePage.sortDesc,
                ),
            };
        },
        showModal() {
            this.visible = true;
        },
        hideModal() {
            this.visible = false;
        },
        search() {

        },
        close() {

        },
    },
};
</script>
<style lang="scss" scoped>
</style>
