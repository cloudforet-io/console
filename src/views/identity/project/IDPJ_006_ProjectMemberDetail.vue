<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="projectMemberData.members"
                   :fields="fields"
                   :per-page="perPage"
                   searchable
                   :total-rows="totalCount"
                   :search-context-data="memberModalQueryData"
                   show-caption
                   :busy="isLoading"
                   :cardless="false"
                   underlined
                   is-empty-search
                   @rowSelected="rowSelected"
                   @list="listMembersOnModal"
                   @limitChanged="limitChanged"
                   @onSelectAll="rowAllSelected"
                   @empty="projectMemberData.members = []"
        />
        <br>
        <b-card>
          <b-col ref="IDPJ006_tagPanel" cols="12" class="row-scroll p-0">
            <InputTag v-for="(tag, idx) in projectMemberData.tagList"
                      ref="tag"
                      :key="tag.id"
                      use-tag-only
                      class="input-tag"
                      :tabindex="idx"
                      :idx="idx"
                      :list-data="[]"
                      :contents="tag"
                      :class="{focused: tag.focused}"
                      @delete="deleteMember(idx)"
            />
          </b-col>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <slot name="footerArea">
        <div class="col-md-12">
          <div class="modal-footer" style="border-top:none; padding-right: 0px">
            <b-button size="md" variant="primary" @click="addUser">
              {{ $t('MSG.BTN_ADD') }}
            </b-button>
            <b-button size="md" variant="light" @click="closeWindow">
              {{ $t('MSG.BTN_CANCEL') }}
            </b-button>
          </div>
        </div>
      </slot>
    </b-row>
  </div>
</template>
<script>

import query from '@/views/identity/project/search_context/search_context';
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import InputTag from '@/components/base/input/BAIN_002_EXT_InputTag';

export default {
    name: 'ProjectMember',
    event: ['close'],
    components: {
        BaseTable,
        InputTag
    },
    data() {
        return {
            projectMemberData:{ members:[], tagList: []} ,
            anySelectedRow: false,
            selectedUserMulti: null,
            selectedUser: null,
            selectedIdx: undefined,
            isFooterVisible: true,
            memberModalQueryData: query,
            memberModalQuery: {},
            totalCount: 0,
            perPage: 10,
            isLoading: true,
            selectedModalItems: [],
            selectedModalObject: {},
            selectedModalMember: null

        };
    },
    computed: {
        fields () {
            return [
                { key: 'user_id', label: 'User ID', sortable: true, ajaxSortable: false ,thStyle: { width: '150px' }},
                { key: 'name', label: 'Name', sortable: true, ajaxSortable: true ,thStyle: { width: '150px' }},
                { key: 'email', label: 'Email', sortable: true, ajaxSortable: false , thStyle: { width: '230px' }},
                { key: 'group', label: 'Group', sortable: true, ajaxSortable: false, thStyle: { width: '150px' }}
            ];
        },
        isMultiSelected () {
            return this.selectedModalItems.length > 1;
        },
        hasSelectedMember () {
            return this.selectedModalItems.length > 0;
        },
        selectedMembers () {
            return this.selectedModalItems.map((item) => {
                return item.data;
            });
        }
    },
    mounted() {
        this.isLoading = false;
    },
    methods: {
        init() {
            this.listMembersOnModal(this.perPage, 0);
        },
        reset () {
            this.projectMemberData.members = [];
            this.selectedModalMember = null;
            this.isLoading = true;
        },
        saveMemberModalMeta (limit, start, sort, filter, filterOr) {
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
            this.memberModalQuery = {
                sort,
                page: {
                    start: start,
                    limit
                },
                filter_or: filterOr,
                filter: [
                    { key: 'user_id' ,value: this.$attrs.memebers, operator: 'not_in' }
                ]
            };
        },
        async listMembersOnModal (limit, start, sort, filter, filterOr){
            this.reset();
            this.saveMemberModalMeta(limit, start, sort, filter, filterOr);
            await this.$axios.post('/identity/user/list',{
                query: this.memberModalQuery
            }).then((response) => {
                this.projectMemberData.members = response.data.results;
                this.totalCount = response.data.total_count;
                this.isLoading = false;
            }).catch((error) =>{
                console.error(error);
                this.isLoading = false;
            });
        },
        rowSelected (rows) {
            this.selectedModalItems = rows;
            if (rows.length === 1) {
                this.selectedIdx = rows[0].idx;
                this.selectedModalMember = rows[0];
            }

            const selectedObject ={
                key: rows[0].data.user_id,
                subKey: rows[0].data.name
            };

            const el = this.projectMemberData.tagList.filter(function(el) {
                return el.key === rows[0].data.user_id;
            });

            if (!el.length){
                this.projectMemberData.tagList.push(selectedObject);
                console.log('tagValue', this.projectMemberData.tagList);
                this.onfocusOnBottom();
            }
        },
        rowAllSelected (isSelectedAll, rows) {
            this.selectedModalItems = rows;
        },
        limitChanged(val) {
            this.perPage = Number(val);
            this.init();
        },
        deleteSelected() {
            this.$refs.IDPJ006_DeleteCheck.showModal();
        },
        async addUser() {
            let url = null;

            const projectSelected = this.$attrs['selected-data'];
            const selected_id = projectSelected.hasOwnProperty('node') ? projectSelected.node.data.id : projectSelected.nodes[0].data.id;
            const selected_type = projectSelected.hasOwnProperty('node') ? projectSelected.node.data.item_type : projectSelected.nodes[0].data.item_type;

            let param = {
                query: this.searchQuery
            };

            if (selected_type === 'PROJECT_GROUP'){
                url = '/identity/project-group/member/add';
                param['project_group_id'] =  selected_id;
            } else {
                url = '/identity/project/member/add';
                param['project_id'] =  selected_id;
            }

            if (this.selectedModalItems.length > 0){
                const currentUsers = this.projectMemberData.tagList;
                param['users'] = this.getSelectedValArr(currentUsers,'key');
            } else {
                return;
            }

            await this.$axios.post(url, param).then((response) => {
                this.$parent.$parent.$parent.$parent.$parent.listMembers();
                this.$emit('close');
            }).catch((error) => {
                console.error(error);
            });
        },
        deleteMember (idx) {
            this.$delete(this.projectMemberData.tagList, idx);
        },
        onfocusOnBottom () {
            this.$refs.IDPJ006_tagPanel.scrollTop = this.$refs.IDPJ006_tagPanel.scrollHeight;
        },
        closeWindow(e) {
            this.$emit('close');
        }
    }
};
</script>

<style lang="scss" scoped>
  $input-height: 30px;
  $line-height: 30px;
  $search-btn-width: 50px;

  .search-container {
    position: relative;
    .input-container {
      border: 0;
      border-radius: 5px 0 0 5px;
      background-color: $white;
      padding-left: 5px;
      width: calc(100% - #{$search-btn-width});
      vertical-align: middle;
      line-height: $line-height;

      $close-btn-width: 35px;
      .input-box {
        display: inline-block;
        width: calc(100% - #{$close-btn-width});
        cursor: text;
        vertical-align: middle;
        min-height: $input-height;
        .input-tag {
          &:focus {
          }
        }
        .input {
          display: inline-block;
          vertical-align: middle;
        }
      }
      .input-delete-button {
        display: inline-block;
        width: $close-btn-width;
        padding-right: 8px;
        font-size: 1.2em;
        color: $darkgray;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
      }
    }
    .search-btn {
      border: 0;
      border-radius: 0 5px 5px 0;
      color: darken($darkgray, 25%);
      width: $search-btn-width;
      background: $darkgray;
      &:hover {
        color: $white;
        background: $navy;
      }
    }
  }
  .row-scroll {
    height: 150px;
    overflow-y:scroll;
  }
</style>
