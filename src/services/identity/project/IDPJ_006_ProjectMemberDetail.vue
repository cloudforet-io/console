<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="6" sm="4" md="2" class="mb-3">
        <BaseModal :name="'addUser'" :title="'Add User'" :centered="true" :hide-footer="true">
          <template #activator>
            <b-button block variant="outline-primary">
              Add
            </b-button>
          </template>
          <template #contents>
            <UserDetail :creatable="true" :updatable="true" />
          </template>
        </BaseModal>
      </b-col>
      <b-col cols="6" sm="4" md="2" class="mb-3">
        <BaseModal v-if="selectedUser" :name="'editUser'" :title="'Edit User'"
                   :centered="true" :hide-footer="true"
        >
          <template #activator>
            <b-button block variant="outline-primary">
              Edit
            </b-button>
          </template>
          <template #contents>
            <UserDetail :updatable="true" :user-prop="selectedUser" />
          </template>
        </BaseModal>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="users" :fields="fields" :per-page="3"
                   caption="Users" :searchable="true" :list-fn="listUsers"
                   :row-clicked-fn="rowClicked" :total-rows="totalCount"
                   :query-data="query"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-card v-if="selectedUser">
          <div slot="header">
            <strong>User Detail</strong>
          </div>
          <UserDetail v-if="selectedUser" :user-prop="selectedUser" />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import CTSB_001_Sidebars from '@/components/base/tabs/BATA_001_BaseTabs'
  import BaseModal from '@/components/base/modal/BAMO_001_BaseModal'
  import BaseTree from '@/components/base/tree/BATR_001_BaseTree'
  import {api} from '@/setup/api'

  export default {
    name: 'ProjectMemberDetail',
    components: {

    },
    props:{

    },
    created(){
        debugger;
    },
    mounted: function () {

    },
    data() {
      return {

      }
    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>

</style>
