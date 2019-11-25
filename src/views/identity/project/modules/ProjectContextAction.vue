<template>
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
            ㅁㄴㅇㄹㅁㄴ이럼ㄴ이ㅏ럼니알
        </template>
        <template #close-button>
            {{ tr('COMMON.BTN_CANCEL') }}
        </template>
        <template #confirm-button>
            {{ tr('COMMON.BTN_OK') }}
        </template>
    </p-button-modal>
</template>
<script>
import _ from 'lodash';
import { defaultQuery } from '@/lib/api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';
import PInputTag from '@/components/molecules/input-tag/InputTag';

export default {
    name: 'ProjectContextAction',
    components: {
        PButtonModal,
        PInputTag,
    },
    props: {
        selectedNode: {
            type: Object,
            default: null,
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
            tagRelated: {
                currentTagText: '',
                Tags: [],
                placeHolder: '',
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
        changePageSize() {
            this.tablePage.thisPage = 1;
            this.tablePage.allPage = 1;
            this.listMembers();
        },
        getMembers() {
            this.listMembersOnSearch();
        },
        showModal() {
            this.visible = true;
        },
        hideModal() {
            this.visible = false;
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
        async addUserOnProject() {
            const selectedNodeDT = this.$parent.selectedNode.node.data;
            const selectedId = (selectedNodeDT.item_type === 'PROJECT_GROUP') ? { project_group_id: selectedNodeDT.id } : { project_id: selectedNodeDT.id };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-').toLowerCase()}/member/add`;
            const param = { users: _.map(this.tagRelated.Tags, 'text'), ...selectedId };

            await this.$http.post(url, param).then(() => {
                this.$parent.getMembers();
                this.tagRelated.Tags = [];
                this.hideModal();
            }).catch((error) => {
                console.error(error);
            });
        },
        onSelect(item, index, event) {
            if (!_.find(this.tagRelated.Tags, { text: item.user_id })) {
                this.tagRelated.Tags.push({ text: item.user_id, tiClasses: ['ti-valid'] });
            }
        },
        search() {
            this.listMembersOnSearch(this.searchText);
        },
        confirm() {
            this.addUserOnProject();
        },
        close() {
            console.log('close Modal');
        },
    },
};
</script>

<style lang="scss" scoped>
    .base-table {
        @extend %sheet;
    }
    .btn-margin{
        margin-left: 1rem;
    }
</style>
