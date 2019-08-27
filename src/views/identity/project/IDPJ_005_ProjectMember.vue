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
                    <MemberDetail :creatable="true" :updatable="true"
                                  @close="$refs.addMember.hideModal()"
                    />
                  </template>
                </BaseModal>
              </b-col>
              <b-col cols="6">
                <template v-if="anySelectedRow">
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

    <BaseModal ref="IDPJ005_DeleteUser"
               title="Delete Member"
               size="md"
               @ok="$alertify.success('Selected User Successfully deleted.')"
               @cancel="$alertify.error('Action Cancel')"
    >
      <template #contents>
        <span>Do you want to delete selected?</span>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import searchContext from '@/views/identity/project/search_context/search_context';
import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue';
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const MemberDetail = () => import('@/views/identity/project/IDPJ_006_ProjectMemberDetail');

export default {
    name: 'ProjectMember',
    components: {
        BaseTable,
        BaseModal,
        MemberDetail
    },
    data () {
        return {
            members: [],
            anySelectedRow: false,
            selectedMemberMulti: null,
            selectedMember: null,
            selectedIdx: undefined,
            addModal: false,
            totalCount: 17,
            searchQueryData: searchContext,
            searchQuery: {},
            isReadyForSearch: false,
            perPage: 3,
            isLoading: true
        };
    },
    computed: {
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
        hasSelectedUser () {
            return !!(this.isMultiSelected || this.selectedUser);
        },
        multiSelectedUserList () {
            return this.multiSelectedList.map((item) => {
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

            if (this.$attrs['selected-data'].nodes[0].data.item_type === 'PROJECT_GROUP'){
                url = '/identity/project-group/member/list';
                this.searchQuery['project_group_id'] =  this.$attrs['selected-data'].nodes[0].data.id;
            } else {
                url = '/identity/project/member/list';
                this.searchQuery['project_id'] =  this.$attrs['selected-data'].nodes[0].data.id;
            }

            await this.$axios.post(url, this.searchQuery).then((response) => {
                let results = [];
                if (!this.isEmpty(response.data.results)){
                    response.data.results.forEach(function(current){
                        current.user_info['role'] = current.user_info.roles.join(', ');
                        results.push(current.user_info);
                    });
                    this.bindAdditionalKey(results, 'state', 'MEMBER_STATE');

                }
                this.members = results;
                console.log(response.data.results);
                this.isLoading = false;
            }).catch((error) =>{
                console.error(error);
                this.isLoading = false;
            });

        /**
         * TODO: set totalCount with data from server
         */
        },
        rowSelected (row) {
            if (this.isEmpty(row) || row.length < 1) {
                this.selectedMember = null;
                this.anySelectedRow = false;
            } else {
                this.selectedMember = row;
                this.selectedMemberMulti = row;
                this.anySelectedRow = true;
            }
        },
        rowAllSelected (row) {
            if (row instanceof Array && !this.isEmpty(row)) {
                this.selectedMemberMulti = row;
                this.anySelectedRow = true;
            } else {
                this.selectedMemberMulti = null;
                this.anySelectedRow = false;
            }
        },
        limitChanged (val) {
            this.perPage = Number(val);
            this.init();
        },
        deleteSelected () {
            this.$refs.IDPJ005_DeleteUser.showModal();
        }
    }
};
</script>

<style lang="scss" scoped>
  .base-table {
    @extend %sheet;
  }
</style>
