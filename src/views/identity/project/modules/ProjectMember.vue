<template>
    <div>
        <project-member-detail ref="MemberAdd">
        </project-member-detail>
        <p-toolbox-table :items="members"
                         :style="responsiveStyle"
                         :fields="fields"
                         :selectable="selectable"
                         :sortable="sortable"
                         :sort-by.sync="tablePage.sortBy"
                         :sort-desc.sync="tablePage.sortDesc"
                         :all-page="tablePage.allPage"
                         :this-page.sync="tablePage.thisPage"
                         :select-index.sync="selectIndex"
                         :page-size.sync="tablePage.pageSize"
                         @changePageSize="changePageSize"
                         @changeSort="getMembers(true)"
                         @changePageNumber="getMembers(true)"
                         @clickRefresh="getMembers"
        >
            <template slot="toolbox-left">
                <p-button style-type="primary" @click="showModals">
                    Add Member
                </p-button>
                <p-button style-type="primary" :disabled="isDisabled" class="btn-margin">
                    Delete Member
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
            <template v-slot:col-roles-format="data">
                {{ data.item.user_info.roles }}
            </template>
        </p-toolbox-table>
    </div>
</template>
<script>
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';
import PButton from '@/components/atoms/buttons/Button';
import ProjectMemberDetail from '@/views/identity/project/modules/ProjectMemberDetail';
import { defaultQuery } from '@/lib/api';
import PContentModal from '@/components/organisms/modals/content-modal/ContentModal';

export default {
    name: 'ProjectMember',
    components: {
        /* ProjectMemberDetail, */
        PToolboxTable,
        PButton,
        PContentModal,
    },
    props: {
        selectedNode: {
            type: Object,
            default: null,
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
        isDisabled() {
            return !(this.selectIndex.length > 0);
        },
        selectedFields() {
            return [
                {
                    key: 'user_id', label: this.tr('COMMON.COL_NM.UID'),
                },
                {
                    key: 'name', label: this.tr('COL_NM.NAME'),
                },
                {
                    key: 'state', label: this.tr('COL_NM.STATE'),
                },
                {
                    key: 'email', label: this.tr('COL_NM.EMAIL'),
                },
            ];
        }, // state
        fields() {
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
                {
                    name: 'group', label: this.tr('COMMON.GROUP'),
                },
                {
                    name: 'roles', label: this.tr('COMMON.ROLE'),
                },
            ];
        },
    },
    mounted() {
        this.listMembers();
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
        showModals() {
            this.$refs.modal.show();
        },
        reset() {
            this.members = [];
        },
        getMembers(fixSort) {
            if (!fixSort) {
                this.tablePage.sortBy = '';
                this.tablePage.sortDesc = true;
            }
            this.listMembers();
        },
        changePageSize() {
            this.tablePage.thisPage = 1;
            this.tablePage.allPage = 1;
            this.listMembers();
        },
        async listMembers() {
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
                            console.log('success');
                        }
                    }).catch((error) =>{
                        console.log(error);
                    }); */
            }
        },
        actionCommand() {
            const itemType = this.getSelectedInfo('item_type') === 'PROJECT_GROUP' ? this.tr('PG_GR') : this.tr('PG');
            if (this.actionFlag === 'delete') {
                const obj = {};
                obj.title = this.tr('DEL_MEM');
                obj.type = 'danger';
                obj.text = this.tr('DELETE_YN', [itemType]);
                this.actionCommandData = obj;
            }
            this.$refs.IDPJ005_DeleteUser.showModal();
        },
        deleteSelected() {
            this.actionFlag = 'delete';
            this.actionCommand();
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
