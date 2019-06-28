<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <b-card>
          <div>
            <div class="d-flex align-items-center ml-2">
              Current actions: {{ lastEvent }}
            </div>
              <BaseModal  ref="Modal" :name="'EditModal'"  :title="projectModaltitle" :centered="true" :hide-footer="true">
                  <template #contents>
                    <BaseTabs id="EditBaseTabs" is="BaseTabs" :tabs="projTabs" :tabIndex="projIndex" :key="tabs.path" :fill="true" :isfooterVisible="true">
                      <template #tabContentsPanel>

                      </template>
                    </BaseTabs>
                  </template>
              </BaseModal>
          </div>
        </b-card>
      </div>
    </div>
    <BaseTree ref='projectTree'>
        <template #treeSubPanel>
          <BaseTabs is="BaseTabs" id="ContentsBaseTabs" :tabs="tabs" :tabIndex="tabIndex" :key="tabs.tabTitle">
            <template #tabContentsPanel>

            </template>
          </BaseTabs>
        </template>
    </BaseTree>
  </div>
</template>

<script>

  const ProjectAudit = () => import ('./IDPJ_006_ProjectAudit.vue')
  const ProjectMember = () => import('./IDPJ_005_ProjectMember.vue')
  const ProjectSummary = () => import('./IDPJ_004_ProjectSummary.vue')

  import BaseTabs from '@/components/base/tabs/BATA_001_BaseTabs'
  import BaseModal from '@/components/base/modal/BAMO_001_BaseModal'
  import BaseTree from '@/components/base/tree/BATR_001_BaseTree'

  import {api} from '@/setup/api'

  export default {
    name: 'Project',
    components: {
      ProjectAudit,
      ProjectMember,
      ProjectSummary,
      BaseTabs,
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
        tabIndex: [0],
        tabs: [
          {
            name: 'summary',
            tabIcon:"icon-calculator",
            tabTitle:'SUMMARY',
            component: ProjectSummary
          },
          {
            name: 'member',
            tabIcon:"icon-user",
            tabTitle:'MEMBER',
            component: ProjectMember
          },
          {
            name: 'audit',
            tabIcon:"icon-pie-chart",
            tabTitle:'AUDIT',
            component: ProjectAudit
          }
        ],
        projIndex: [0],
        projTabs: [
          {
            tabIcon:"icon-calculator",
            tabTitle:'DEFAULT',
            component: ProjectAudit
          },
          {
            tabIcon:"icon-user",
            tabTitle:'TAGS',
            component:{
              template:'<div></div>'
            }
          },

        ]
      }
    },
    methods: {

    }

  }
</script>

<style lang="scss" scoped>

</style>
