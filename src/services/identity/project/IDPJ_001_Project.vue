<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <b-card>
          <div>
            <div class="d-flex align-items-center ml-2">
              Current actions: {{ lastEvent }}
            </div>
              <BaseModal  id='IDPJ_001_Project_Edit_Modal' ref="Modal" :name="'EditModal'"  :title="projectModaltitle" :centered="true" :hide-footer="true" >
                  <template #contents>
                    <BaseTabs id="EditBaseTabs"
                              is="BaseTabs"
                              :tabs="projTabs"
                              :tabIndex="projIndex"
                              :key="tabs.path" :fill="true"
                              :isfooterVisible="true"
                              :creatable="true"
                              :updatable="true"
                    >
                      <template #ModaltabContentsPanel>
                        <div v-if="selectedProject" :project-prop="selectedProject"  :creatable="true" :updatable="true">

                        </div>
                      </template>
                    </BaseTabs>
                  </template>
              </BaseModal>
          </div>
        </b-card>
      </div>
    </div>
    <BaseTree ref='projectTree' :nodes="node">
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

  const projectEditPopupName = () => import ('./IDPJ_002_ProjectEditPopUp_Name')
  const projectEditPopupTag = () => import('./IDPJ_003_ProjectEditPopUp_Tag')

  const projectAudit = () => import ('./IDPJ_006_ProjectAudit.vue')
  const projectMember = () => import('./IDPJ_005_ProjectMember.vue')
  const projectSummary = () => import('./IDPJ_004_ProjectSummary.vue')

  import BaseTabs from '@/components/base/tabs/BATA_001_BaseTabs'
  import BaseModal from '@/components/base/modal/BAMO_001_BaseModal'
  import BaseTree from '@/components/base/tree/BATR_001_BaseTree'

  import {api} from '@/setup/api'




  export default {
    name: 'Project',
    components: {
      projectEditPopupName,
      projectEditPopupTag,
      projectAudit,
      projectMember,
      projectSummary,
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
        node: [
          {
            "title": "Item1",
            "isLeaf": true
          },
          {
            "title": "Item2",
            "isLeaf": true,
            "data": {
              "visible": false
            }
          },
          {
            "title": "Folder1",
            "isSelected": false,
            "isExpanded": false
          },
          {
            "title": "Folder2",
            "isExpanded": false,
            "children": [
              {
                "title": "Item3",
                "isLeaf": true
              },
              {
                "title": "Item4",
                "isLeaf": true
              },
              {
                "title": "Folder3",
                "children": [
                  {
                    "title": "Item5",
                    "isLeaf": true
                  }
                ]
              }
            ],
            "isSelected": true
          },
          {
            "title": "Folder5",
            "isExpanded": false
          },
          {
            "title": "Item6",
            "isLeaf": true
          },
          {
            "title": "Item7",
            "isLeaf": true,
            "data": {
              "visible": false
            }
          },
          {
            "title": "Folder6",
            "children": [
              {
                "title": "Folder7",
                "children": [
                  {
                    "title": "Item8",
                    "isLeaf": true
                  },
                  {
                    "title": "Item9",
                    "isLeaf": true
                  }
                ]
              }
            ]
          }
        ],
        projects: null,
        selectedProject: null,
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
            component: projectSummary
          },
          {
            name: 'member',
            tabIcon:"icon-user",
            tabTitle:'MEMBER',
            component: projectMember
          },
          {
            name: 'audit',
            tabIcon:"icon-pie-chart",
            tabTitle:'AUDIT',
            component: projectAudit
          }
        ],
        projIndex: [0],
        projTabs: [
          {
            tabIcon:"icon-calculator",
            tabTitle:'DEFAULT',
            updatable: true,
            creatable: true,
            component: projectEditPopupName
          },
          {
            tabIcon:"icon-user",
            tabTitle:'TAGS',
            updatable: true,
            creatable: true,
            component: projectEditPopupTag
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
