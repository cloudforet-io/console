<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="admins"
                   :fields="fields"
                   :per-page="perPage"
                   searchable
                   :total-rows="totalCount"
                   :search-context-data="searchQueryData"
                   show-caption
                   :busy="isLoading"
                   :cardless="false"
                   underlined
                   @rowSelected="rowSelected"
                   @list="listAdmins"
                   @limitChanged="limitChanged"
                   @onSelectAll="rowAllSelected"
        >
          <template #caption>
            <b-row align-v="center" align-h="center">
              <b-col  class="pr-1" cols="5" >
                <BaseModal ref="addMember"
                           title="Add Member"
                           centered
                           hide-footer
                >
                  <template #activator>
                    <b-button block variant="primary">
                      {{ $t('MSG.BTN_ADD') }}
                    </b-button>
                  </template>
                  <template #contents>
                    <AdminDetail creatable
                                  updatable
                                  :admins="adminUserIDs"
                                  :selected-data="anySelectedRow"
                                  @close="$refs.addMember.hideModal()"
                    />
                  </template>
                </BaseModal>
              </b-col>
              <b-col  class="pl-1" cols="5" >
                <template v-if="hasSelectedMember">
                  <b-button class="mr-5" block variant="danger" @click="deleteSelected">
                    {{ $t('MSG.BTN_DELETE') }}
                  </b-button>
                </template>
              </b-col>
              <b-col  cols="2" />
            </b-row>
          </template>
        </BaseTable>
      </b-col>
    </b-row>

    <ActionCheckModal ref="IVDC005_DeleteUser"
                      primary-key="user_id"
                      :data="selectedAdmins"
                      :fields="selectedFields"
                      :action="actionProcess"
                      :title="actionCommandData.title"
                      :type="actionCommandData.type"
                      :text="actionCommandData.text"
                      @succeed="listAdmins"
                      @failed="listAdmins"
    />
  </div>
</template>

<script>
import searchContext from '@/views/identity/project/search-context/query';
import BaseTable from '@/components/base/table/BaseTable';
import ActionCheckModal from '@/components/base/modal/ActionCheckModal';
import BaseModal from '@/components/base/modal/BaseModal';
import AdminDetail from '@/views/inventory/data-center//modules/DataCenterAdminDetail';

export default {
    name: 'DataCenterAdmin',
    components: {
        BaseTable,
        BaseModal,
        AdminDetail,
        ActionCheckModal
    },
    data () {
        return {
            admins: [],
            adminUserIDs: [],
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
        selectedAdmins () {
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
            this.listAdmins(this.perPage, 0);
        },
        reset () {
            this.admins = [];
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
        async listAdmins (limit, start, sort, filter, filterOr) {
            this.reset();
            this.saveMeta(limit, start, sort, filter, filterOr);

            let param = {
                query: this.searchQuery
            };

            const itemType = this.$attrs['selected-data'].node.data.item_type;
            const url = `/inventory/${itemType.toLowerCase()}/admin/list`;
            const key = `${itemType.toLowerCase()}_id`;
            param[key] =  this.$attrs['selected-data'].node.data.id;

            await this.$http.post(url,param).then((response) => {
                let results = [];
                if (!this.isEmpty(response.data.results)){
                    let adminUserIds =[];
                    response.data.results.forEach(function(current){
                        //current.user_info['role'] = current.user_info.roles.join(', ');
                        results.push(current.user_info);
                        adminUserIds.push(current.user_info.user_id);
                    });
                    this.adminUserIDs = adminUserIds;
                }
                this.admins = results;
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
            let param = {};
            let url = null;
            if (this.selectedAdmins.length > 0){
                const adminsIds = this.selectedAdmins;
                const key = `${this.getSelectedInfo('item_type').toLowerCase()}_id`;
                url =   `/inventory/${this.getSelectedInfo('item_type').toLowerCase()}/admin/remove`;
                param[key] =  this.getSelectedInfo('id');
                param['users'] =  this.getSelectedValArr(adminsIds, 'user_id');
            } else {
                return;
            }
            if (!this.isEmpty(url) && !this.isEmpty(param)) {
                await this.$http.post(url, param);
            }
        },
        actionCommand(){
            let itemType = this.getSelectedInfo('item_type') === 'REGION' ? this.tr('MSG.RG') : this.getSelectedInfo('item_type') === 'ZONE' ? this.tr('MSG.ZE'): this.tr('MSG.PL');
            if (this.actionFlag ==='delete'){
                let obj = {};
                obj['title'] = this.tr('MSG.DEL_PARAM', [this.tr('MSG.ADMIN_USER')]);
                obj['type'] = 'danger';
                obj['text'] =  this.tr('DELETE_YN', [itemType]);
                this.actionCommandData = obj;
            }
            this.$refs.IVDC005_DeleteUser.showModal();
        },
        deleteSelected () {
            this.actionFlag = 'delete';
            this.actionCommand();
        }
    }
};
</script>

<style lang="scss" scoped>


  .col-left-gap-measure {
    padding-left: 5px;
  }

  .col-right-gap-measure {
    padding-left: 0px;
    padding-right: 25px;
  }
  .base-table {
    @extend %sheet;
  }
</style>
