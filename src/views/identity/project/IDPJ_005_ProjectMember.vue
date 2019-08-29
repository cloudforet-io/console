<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="members"
                   :fields="fields"
                   :per-page="perPage"
                   :searchable="true"
                   :total-rows="totalCount"
                   :field-id="'user_id'"
                   :search-context-data="searchQueryData"
                   :show-caption="true"
                   :busy="isLoading"
                   :cardless="false"
                   :underlined="true"
                   @rowSelected="rowSelected"
                   @list="listMembers"
                   @limitChanged="limitChanged"
                   @onSelectAll="rowAllSelected"
        >
          <template #caption>
            <b-row align-v="center" align-h="center">
              <b-col cols="6">
                <BaseModal ref="addMember"
                           title="Add Member"
                           :centered="true"
                           :hide-footer="true"
                >
                  <template #activator>
                    <b-button block variant="primary">
                      {{ $t('MSG.BTN_ADD') }}
                    </b-button>
                  </template>
                  <template #contents>
                    <MemberDetail :creatable="true"
                                  :updatable="true"
                                  :memebers="memberUserIDs"
                                  :selected-data="anySelectedRow"
                                  @close="$refs.addMember.hideModal()"
                    />
                  </template>
                </BaseModal>
              </b-col>
              <b-col cols="6">
                <template v-if="hasSelectedMember">
                  <b-button block variant="danger" @click="deleteSelected">
                    {{ $t('MSG.BTN_DELETE') }}
                  </b-button>
                </template>
              </b-col>
            </b-row>
          </template>
        </BaseTable>
      </b-col>
    </b-row>

    <ActionCheckModal ref="IDPJ005_DeleteUser"
                      primary-key="user_id"
                      :data="selectedMembers"
                      :fields="selectedFields"
                      :action="actionProcess"
                      :title="actionCommandData.title"
                      :type="actionCommandData.type"
                      :text="actionCommandData.text"
                      @succeed="listMembers"
                      @failed="listMembers"
    />
  </div>
</template>

<script>
import searchContext from '@/views/identity/project/search_context/search_context';
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import ActionCheckModal from '@/components/base/modal/BAMO_003_EXT_ActionCheckModal';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import MemberDetail from '@/views/identity/project/IDPJ_006_ProjectMemberDetail';

export default {
    name: 'ProjectMember',
    components: {
        BaseTable,
        BaseModal,
        MemberDetail,
        ActionCheckModal
    },
    data () {
        return {
            members: [],
            memberUserIDs: [],
            selectedIdx: undefined,
            addModal: false,
            totalCount: 0,
            searchQueryData: searchContext,
            searchQuery: {},
            actionCommandData:{},
            isReadyForSearch: false,
            perPage: 3,
            actionFlag: null,
            isLoading: true,
            selectedItems: [],
            selectedMember: null
        };
    },
    computed: {
        anySelectedRow(){
            return this.$attrs['selected-data'];
        },
        selectedFields () {
            return [
                { key: 'user_id', label: this.tr('COL_NM.UID'), sortable: true, ajaxSortable: false, thStyle: { width: '150px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'state', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'email', label: this.tr('COL_NM.EMAIL'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }}
            ];
        },
        fields () {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'user_id', label: this.tr('COL_NM.UID'), sortable: true, ajaxSortable: false, thStyle: { width: '150px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'state', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'email', label: this.tr('COL_NM.EMAIL'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'group', label: this.tr('COL_NM.GROUP'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'role', label: this.tr('COL_NM.ROLE'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'roles', label: this.tr('COL_NM.ROLE'), sortable: true, ajaxSortable: false,  thClass: 'd-none', tdClass: 'd-none' }
            ];
        },
        isMultiSelected () {
            return this.selectedItems.length > 1;
        },
        hasSelectedMember () {
            return this.selectedItems.length > 0;
        },
        selectedMembers () {
            return this.selectedItems.map((item) => {
                return item.data;
            });
        }
    },
    mounted () {
        this.init();
    },
    methods: {
        init () {
            this.listMembers(this.perPage, 0);
        },
        reset () {
            this.members = [];
            this.selectedMember = null;
            this.isLoading = true;
        },
        saveMeta (limit, start, sort, filter, filterOr) {
            if (this.isEmpty(limit)) {
                limit = 10;
            }
            if (this.isEmpty(start)) {
                start = 0;
            }
            if (this.isEmpty(sort)) {
                sort = {};
            }
            if (this.isEmpty(filter)) {
                filter = [];
            }
            if (this.isEmpty(filterOr)) {
                filterOr = [];
            }
            this.searchQuery = {
                sort,
                page: {
                    start: start,
                    limit
                },
                filter_or: filterOr
            };
        },
        async listMembers (limit, start, sort, filter, filterOr) {
            this.reset();
            this.saveMeta(limit, start, sort, filter, filterOr);
            let url = null;
            let param = {
                query: this.searchQuery
            };

            if (this.$attrs['selected-data'].node.data.item_type === 'PROJECT_GROUP'){
                url = '/identity/project-group/member/list';
                param['project_group_id'] =  this.$attrs['selected-data'].node.data.id;
            } else {
                url = '/identity/project/member/list';
                param['project_id'] =  this.$attrs['selected-data'].node.data.id;
            }

            console.log('Parameters', JSON.stringify(param));
            await this.$axios.post(url,param).then((response) => {
                let results = [];
                if (!this.isEmpty(response.data.results)){
                    let memberUserIds =[];
                    response.data.results.forEach(function(current){
                        current.user_info['role'] = current.user_info.roles.join(', ');
                        results.push(current.user_info);
                        memberUserIds.push(current.user_info.user_id);
                    });
                    this.memberUserIDs = memberUserIds;
                    this.bindAdditionalKey(results, 'state', 'MEMBER_STATE');

                }
                this.members = results;
                console.log(response.data.results);
                this.isLoading = false;
            }).catch((error) =>{
                console.error(error);
                this.isLoading = false;
            });
        },
        rowSelected (rows) {
            this.selectedItems = rows;
            if (rows.length === 1) {
                this.selectedIdx = rows[0].idx;
            }
        },
        rowAllSelected (isSelectedAll, rows) {
            this.selectedItems = rows;
        },
        limitChanged (val) {
            this.perPage = Number(val);
            this.init();
        },
        getSelectedInfo(key){
            const selectedObj = this.$attrs['selected-data'].node;
            const Obj = {
                id: selectedObj.data.id,
                is_cached: selectedObj.data.is_cached,
                is_root: selectedObj.data.is_root,
                item_type: selectedObj.data.item_type
            };

            if (this.isEmpty(selectedObj)){
                return false;
            } else if (this.isEmpty(key)){
                return Obj;
            } else if (Obj.hasOwnProperty(key)){
                return Obj[key];
            } else {
                return false;
            }
        },
        async actionProcess () {
            let url = null;
            let param = {};

            if (this.selectedMembers.length > 0){
                const membersIds = this.selectedMembers;
                if (this.actionFlag ==='delete'){
                    if (this.getSelectedInfo('item_type') === 'PROJECT_GROUP'){
                        url = '/identity/project-group/member/remove';
                        param['project_group_id'] =  this.getSelectedInfo('id');
                        param['users'] =  this.getSelectedValArr(membersIds, 'user_id');
                    } else {
                        url = '/identity/project/member/remove';
                        param['project_id'] =  this.getSelectedInfo('id');
                        param['users'] =  this.getSelectedValArr(membersIds, 'user_id');
                    }
                }
            } else {
                return;
            }


            if (!this.isEmpty(url) && !this.isEmpty(url)) {
                await this.$axios.post(url,param);
                   /*     .then((response) => {
                    if (this.isEmpty(response.data)){
                        console.log('success');
                    }
                }).catch((error) =>{
                    console.log(error);
                });*/
            }
        },
        actionCommand(){
            let itemType = this.getSelectedInfo('item_type') === 'PROJECT_GROUP' ? this.tr('PG_GR') : this.tr('PG');
            if (this.actionFlag ==='delete'){
                let obj = {};
                obj['title'] = this.tr('DEL_MEM');
                obj['type'] = 'danger';
                obj['text'] =  this.tr('DELETE_YN', [itemType]);
                this.actionCommandData = obj;
            }
            this.$refs.IDPJ005_DeleteUser.showModal();
        },
        deleteSelected () {
            this.actionFlag = 'delete';
            this.actionCommand();
        }
    }
};
</script>

<style lang="scss" scoped>
  .base-table {
    @extend %sheet;
  }
</style>
