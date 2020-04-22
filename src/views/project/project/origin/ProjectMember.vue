<template>
    <div>
        <project-member-add ref="MemberAdd"
                            :reference-member="getBindMember"
        />
        <project-member-delete ref="MemberDelete"
                               :reference-member="getMemberData"
        />
        <p-toolbox-table :items="members"
                         :fields="fields"
                         :shadow="false"
                         :border="false"
                         :hover="true"
                         :responsive-style="{'height': getPropHeight + 'px', 'overflow-y':'auto'}"
                         :selectable="selectable"
                         :sortable="sortable"
                         :sort-by.sync="tablePage.sortBy"
                         :sort-desc.sync="tablePage.sortDesc"
                         :all-page="tablePage.allPage"
                         :this-page.sync="tablePage.thisPage"
                         :select-index.sync="selectIndex"
                         :page-size.sync="tablePage.pageSize"
                         :loading="loading"
                         :setting-visible="false"
                         :use-cursor-loading="true"
                         @changePageSize="changePageSize"
                         @changeSort="getMembers"
                         @changePageNumber="getMembers"
                         @clickRefresh="getMembers"
        >
            <template slot="toolbox-left">
                <p-button style-type="primary-dark" @click="showModals('add')">
                    {{$t('BTN.ADD') }}
                </p-button>
                <p-button style-type="alert" :outline="true"
                          :disabled="isDisabled"
                          class="btn-margin"
                          @click="showModals('del')"
                >
                    {{$t('BTN.DELETE') }}
                </p-button>
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
            <template v-slot:col-labels-format="data">
                <div>
                    <PBadge v-for="(label, idx) in data.item.labels" :key="idx"
                            class="p-label" style-type="gray200"
                    >
                        {{ getEmptyString(label) }}
                    </PBadge>
                </div>
            </template>
        </p-toolbox-table>
    </div>
</template>
<script>
import _ from 'lodash';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';
import ProjectMemberAdd from '@/views/project/project/origin/ProjectMemberAdd';
import ProjectMemberDelete from '@/views/project/project/origin/ProjectMemberDelete';
import PI from '@/components/atoms/icons/PI';
import PBadge from '@/components/atoms/badges/Badge';
import {defaultQuery} from "@/lib/api/query";

export default {
    name: 'ProjectMember',
    components: {
        PToolboxTable,
        PButton,
        PI,
        ProjectMemberAdd,
        ProjectMemberDelete,
        PBadge,
    },
    props: {
        tabBasicHeight: {
            type: Number,
            default: 40,
        },
        selectedNode: {
            type: Object,
            default: null,
        },
        referenceMember: {
            type: Array,
            default: () => [],
        },
        responsiveStyle: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            members: [],
            selectable: true,
            sortable: true,
            selectIndex: [],
            loading: false,
            tablePage: {
                sortBy: 'user_id',
                sortDesc: false,
                thisPage: 1,
                allPage: 1,
                pageSize: 15,
            },
        };
    },
    computed: {
        getPropHeight() {
            return this.tabBasicHeight;
        },
        getBindMember() {
            return _.map(this.members, 'user_info.user_id');
        },
        getMemberData() {
            return this.members;
        },
        isDisabled() {
            return !(this.selectIndex.length > 0);
        },
        fields() {
            return [
                {
                    name: 'user_id', label: this.$t('COMMON.UID'), style: { width: '145px' },
                },
                {
                    name: 'name', label: this.$t('COMMON.NAME'), style: { width: '200px' },
                },
                {
                    name: 'email', label: this.$t('COMMON.EMAIL'), style: { width: '150px' },
                },
                {
                    name: 'group', label: this.$t('COMMON.GROUP'), style: { width: '120px' },
                },
                {
                    name: 'labels', label: this.$t('COMMON.LABELS'), style: { width: '120px' },
                },
            ];
        },
    },
    mounted() {
        this.listMembers();
    },
    methods: {
        getEmptyString(object) {
            return this.isEmpty(object) ? '' : object;
        },
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
            this.listMembers();
        },
        changePageSize() {
            this.tablePage.thisPage = 1;
            this.tablePage.allPage = 1;
            this.listMembers();
        },
        reset() {
            this.members = [];
        },
        async listMembers() {
            this.loading = true;
            const query = this.getDefaultQuery();
            const selectedNodeDT = this.selectedNode.node.data;
            const param = selectedNodeDT.item_type === 'PROJECT_GROUP' ? { project_group_id: selectedNodeDT.id, ...query } : { project_id: selectedNodeDT.id, ...query };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-')}/member/list`;
            await this.$http.post(url, param).then((response) => {
                this.members = response.data.results;
                const allPage = Math.ceil(response.data.total_count / this.tablePage.pageSize);
                this.tablePage.allPage = allPage || 1;
                this.selectIndex = [];
            }).catch((error) => {
                console.error(error);
            });
            this.loading = false;
        },
        getSelectedInfo(key) {
            const selectedObj = this.$attrs['selected-data'].node;
            const Obj = {
                id: selectedObj.data.id,
                is_cached: selectedObj.data.is_cached,
                is_root: selectedObj.data.is_root,
                item_type: selectedObj.data.item_type,
            };

            if (this.isEmpty(selectedObj)) {
                return false;
            } if (this.isEmpty(key)) {
                return Obj;
            } if (Obj.hasOwnProperty(key)) {
                return Obj[key];
            }
            return false;
        },
        async actionProcess() {
            let url = null;
            const param = {};

            if (this.selectedMembers.length > 0) {
                const membersIds = this.selectedMembers;
                if (this.actionFlag === 'delete') {
                    if (this.getSelectedInfo('item_type') === 'PROJECT_GROUP') {
                        url = '/identity/project-group/member/remove';
                        param.project_group_id = this.getSelectedInfo('id');
                        param.users = this.getSelectedValArr(membersIds, 'user_id');
                    } else {
                        url = '/identity/project/member/remove';
                        param.project_id = this.getSelectedInfo('id');
                        param.users = this.getSelectedValArr(membersIds, 'user_id');
                    }
                }
            } else {
                return;
            }
            if (!this.isEmpty(url) && !this.isEmpty(url)) {
                await this.$http.post(url, param);
                /*     .then((response) => {
                        if (this.isEmpty(response.data)){
                            console.debug('success');
                        }
                    }).catch((error) =>{
                        console.error(error);
                    }); */
            }
        },
        actionCommand() {
            const itemType = this.getSelectedInfo('item_type') === 'PROJECT_GROUP' ? this.$t('PROJECT_GRP') : this.$t('PROJECT');
            if (this.actionFlag === 'delete') {
                const obj = {};
                obj.title = this.$t('DEL_MEM');
                obj.type = 'danger';
                obj.text = this.$t('DELETE_YN', [itemType]);
                this.actionCommandData = obj;
            }
            this.$refs.IDPJ005_DeleteUser.showModal();
        },
        deleteSelected() {
            this.actionFlag = 'delete';
            this.actionCommand();
        },
        showModals(type) {
            if (type === 'add') {
                this.$refs.MemberAdd.showModal();
            } else {
                this.$refs.MemberDelete.showModal();
            }
        },
    },
};
</script>

<style lang="postcss" scoped>
    .p-label {
        @apply text-gray-900;
        margin-bottom:5px;
        margin-right: 0.5rem;
    }
    .base-table {
        box-shadow: 0px 0 10px 0px rgba(theme('colors.black'), 0.1);
  border-radius: 7px;
    }
    .btn-margin{
        margin-left: 1rem;
    }
</style>
