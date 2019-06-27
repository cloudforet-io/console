<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <b-card>
          <div>
            <div class="d-flex align-items-center ml-2">
              Current actions: {{ lastEvent }}
            </div>
              <BaseModal ref="Modal" :name="'Edit selected Project'"  :title="projectModaltitle" :centered="true" :hide-footer="true">
                  <template #contents>

                  </template>
              </BaseModal>
          </div>
        </b-card>
      </div>
    </div>
    <BaseTree ref='projectTree'>
        <template slot="treeSubPanel">
            asdfasdf
        </template>
    </BaseTree>
  </div>
</template>

<script>
  import BaseModal from '@/components/base/BaseModal'
  import BaseTree from '@/components/base/BaseTree'
  import {api} from '@/setup/api'

  export default {
    name: 'Project',
    components: {
      BaseTree,
      BaseModal,
      VueAlertify
    },
    props:{

    },
    mounted: function () {

    },
    data() {
      return {
        projectModaltitle: 'Edit a Project',
        modalVisible: false,
        lastEvent: 'Right-Click to open context menus on tree.',
        selectedNodesTitle: '',
        tabIndex: [0, 0],
        tabs: [
          'SUMMARY',
          'MEMBER',
          'AUDIT'
        ],
        projIndex: [0, 0],
        projtabs: [
          'PROJECT',
          'TAGS',
        ]
      }
    },
    methods: {

    }

  }
</script>

<style lang="scss" scoped>

</style>
