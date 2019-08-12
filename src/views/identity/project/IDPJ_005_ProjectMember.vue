<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="users"
                   :fields="fields"
                   :per-page="perPage"
                   :searchable="true"
                   :total-rows="totalCount"
                   :search-context-data="queryData"
                   :show-caption="true"
                   :busy="isLoading"
                   :cardless="false"
                   :underlined="true"
                   @rowSelected="rowSelected"
                   @list="listUsers"
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

    <BaseModal ref="deleteUser"
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
import query from '@/views/identity/project/search_context/search_context';
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
            fields: [
                { key: 'selected' },
                { key: 'userId', label: 'ID', sortable: true, ajaxSortable: false },
                { key: 'name', label: 'Name', sortable: true, ajaxSortable: true },
                { key: 'email', label: 'Email', sortable: true, ajaxSortable: false },
                { key: 'mobile', label: 'Phone', sortable: true, ajaxSortable: false },
                { key: 'group', label: 'Group Name', sortable: true, ajaxSortable: false },
                { key: 'language', label: 'Language', sortable: true, ajaxSortable: false },
                { key: 'domainId', label: 'Domain ID' }
            ],
            users: [],
            anySelectedRow: false,
            selectedUserMulti: null,
            selectedUser: null,
            selectedIdx: undefined,
            addModal: false,
            totalCount: 17,
            queryData: query,
            isReadyForSearch: false,
            perPage: 3,
            isLoading: true
        };
    },
    mounted () {
        this.init();
    },
    methods: {
        init () {
            this.listUsers(this.perPage, 0);
        },
        reset () {
            this.users = [];
            this.selectedUser = null;
            this.isLoading = true;
        },
        async listUsers (limit, skip, sort, search) {

            this.reset();
            if (this.isEmpty(limit)) {
                limit = 10;
            }
            if (this.isEmpty(skip)) {
                skip = 0;
            }
            if (this.isEmpty(sort)) {
                sort = '-created_date';
            }
            if (this.isEmpty(search)) {
                search = [];
            }

            let res = null;
            try {
                res = await this.$axios.get('/identity/user', {
                    params: { limit, skip, sort }
                });

                setTimeout(() => { // this is for test
                    this.users = res.data;
                    this.isLoading = false;
                }, 1000);
            } catch (e) {
                console.error(e);
                this.users = [
                    {
                        userId: 'abc',
                        name: 'abc',
                        email: 'abc@abc',
                        mobile: '222',
                        group: 'abcabczzz',
                        language: 'en',
                        domainId: 'abcabc',
                        tags: [
                            { abc: 'abc11' },
                            { abc2: 'abc2222' },
                            { abc3: 'abc333' }
                        ]
                    },
                    {
                        userId: 'zzz',
                        name: 'zzz',
                        email: 'zzz@abc',
                        mobile: '333',
                        group: 'zdzfzdsfsdf',
                        language: 'en',
                        domainId: 'wrwrw',
                        tags: [
                            { zzz1: 'ztest' },
                            { zzz22: 'test222' },
                            { zzz333: 'teset33' }
                        ]
                    }
                ];
                this.isLoading = false;
            }

        /**
         * TODO: set totalCount with data from server
         */
        },
        rowSelected (row) {
            if (this.isEmpty(row) || row.length < 1) {
                this.selectedUser = null;
                this.anySelectedRow = false;
            } else {
                this.selectedUser = row;
                this.selectedUserMulti = row;
                this.anySelectedRow = true;
            }
        },
        rowAllSelected (row) {
            if (row instanceof Array && !this.isEmpty(row)) {
                this.selectedUserMulti = row;
                this.anySelectedRow = true;
            } else {
                this.selectedUserMulti = null;
                this.anySelectedRow = false;
            }
        },
        limitChanged (val) {
            this.perPage = Number(val);
            this.init();
        },
        deleteSelected () {
            this.$refs.deleteUser.showModal();
        }
    }
};
</script>

<style lang="scss" scoped>
  .base-table {
    @extend %sheet;
  }
</style>
