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
                <p-toolbox-table :items="users"
                                 :responsive-style="{'height': '35vh', 'overflow-y':'auto', 'box-shadow': 'none', 'border':'none'}"
                                 :fields="selectedFields"
                                 :selectable="false"
                                 :sortable="true"
                                 :shadow="false"
                                 :border="false"
                                 :sort-by.sync="tablePage.sortBy"
                                 :sort-desc.sync="tablePage.sortDesc"
                                 :all-page="tablePage.allPage"
                                 :this-page.sync="tablePage.thisPage"
                                 :select-index.sync="selectIndex"
                                 :page-size.sync="tablePage.pageSize"
                                 @rowLeftClick="onSelect"
                                 @changePageSize="getMembers"
                                 @changeSort="getMembers"
                                 @changePageNumber="getMembers"
                                 @clickRefresh="getMembers"
                >
                    <template slot="toolbox-left">
                        <p-search
                            :search-placeholder="getSearchPlaceHolder"
                            :search-text.sync="searchText"
                            @onSearch="search"
                        />
                    </template>
                    <template v-slot:col-user_id-format="data">
                        {{ data.item.user_id }}
                    </template>
                    <template v-slot:col-name-format="data">
                        {{ data.item.name }}
                    </template>
                    <template v-slot:col-email-format="data">
                        {{ data.item.email }}
                    </template>
                </p-toolbox-table>
                <div class="card tag-input" />
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
    props: {
        referenceMember: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            visible: false,
            users: [],
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
        getMembers() {
            this.listMembersOnSearch();
        },
        changePageSize() {
            this.tablePage.thisPage = 1;
            this.tablePage.allPage = 1;
            this.listMembers();
        },
        async listMembersOnSearch(text) {
            const defaultQuery = this.getDefaultQuery();
            const query = {
                keyword: this.isEmpty(text) ? this.searchText : text,
                filter: [
                    { key: 'user_id', value: this.referenceMember, operator: 'not_in' },
                ],
                ...defaultQuery,
            };
            await this.$http.post('/identity/user/list', { query }).then((response) => {
                this.users = response.data.results;
                const allPage = Math.ceil(response.data.total_count / this.tablePage.pageSize);
                this.tablePage.allPage = allPage || 1;
                this.selectIndex = [];
            }).catch((error) => {
                console.error(error);
            });

        },
        showModal() {
            this.visible = true;
        },
        hideModal() {
            this.visible = false;
        },
        onSelect(e, text){
            debugger;
        },
        search() {
            this.listMembersOnSearch(this.searchText);
        },
        confirm() {

        },
        close() {

        },
    },
};
</script>
<style lang="scss" scoped>
    .tag-input {
        height: 20vh;
        overflow-y: auto;
        background: $primary4 0% 0% no-repeat padding-box;
        border: 1px solid $gray3;
        opacity: 1;
    }
</style>
