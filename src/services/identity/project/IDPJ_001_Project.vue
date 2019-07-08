<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <b-card>
          <div>
            <div class="d-flex align-items-center ml-2">
              {{ lastEvent }}
            </div>
                <BaseModal id='IDPJ_001_Project_Edit_Modal'
                         ref="Modal"
                         :name="'EditModal'"
                         :title="projectModaltitle"
                         :centered="true"
                         :hide-footer="true" >
                  <template #contents>
                    <BaseTabs id="EditBaseTabs"
                              ref="EditTab"
                              is="BaseTabs"
                              :tabs="projTabs"
                              :tabIndex="projIndex"
                              :key="tabs.path"
                              :fill="true"
                              :isfooterVisible="true"
                              :isCreatable="createProcess"
                              :isUpdatable="updateProcess"
                              :isDeletable="deleteProcess">
                        <template #ModaltabContentsPanel>
                            <div v-if="selectedProject" :project-prop="selectedProject">
                            </div>
                        </template>
                    </BaseTabs>
                  </template>
              </BaseModal>
          </div>
        </b-card>
      </div>
    </div>
    <BaseTree ref='projectTree'
              :tree-prop="treeData"
              @selected="NodeSelected"
              @edited="editSelected">
        <template #treeSubPanel>
          <BaseTabs is="BaseTabs" id="ContentsBaseTabs" :tabs="tabs" :tabIndex="tabIndex" :key="tabs.tabTitle">
            <keep-alive>
              <template #tabContentsPanel>
              </template>
            </keep-alive>
          </BaseTabs>
        </template>
    </BaseTree>
  </div>
</template>

<script>

  const sampleNode = [
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
  ];

  const projectEditPopupName = () => import ('./IDPJ_002_ProjectEditPopupName')
  const projectEditPopupTag = () => import('./IDPJ_003_ProjectEditPopupTag')

  import projectAudit from './IDPJ_007_ProjectAudit.vue';
  import projectMember from './IDPJ_005_ProjectMember.vue';
  import projectSummary from './IDPJ_004_ProjectSummary.vue';

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
    children: [
      {
        path: 'summary',
        name: 'summary',
        meta: { label: 'SUMMARY', requiresAuth: true },
        component: projectSummary
      },
      {
        path: 'member',
        name: 'member',
        meta: { label: 'Member', requiresAuth: true },
        component: projectMember
      }
    ],
    data() {
      return {
        createProcess: false,
        updateProcess: false,
        deleteProcess: false,
        treeData: sampleNode,
        projectModaltitle: 'Edit a Project',
        modalVisible: false,
        lastEvent: 'Right-Click to open context menus on tree.',
        tabIndex: [0],
        tabs: [
          {
            name: 'summary',
            isSelected: true,
            tabIcon:"icon-calculator",
            tabTitle:'SUMMARY',
            component: projectSummary
          },
          {
            name: 'member',
            isSelected: false,
            tabIcon:"icon-user",
            tabTitle:'MEMBER',
            component: projectMember
          },
          {
            name: 'audit',
            isSelected: false,
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
      manageTabButton(flag,state){
        /*
         * CRT
         * UPT
         * DEL
         */
        if (flag==='CRT') {
          this.updateProcess = !state;
          this.createProcess =  state;
        } else if(flag==='UPT'){
          this.createProcess = !state;
          this.updateProcess = state;
        } else {

        }
      },
      NodeSelected(item) {
        this.lastEvent = "You have Selected : " + item[0].title;
      },
      editSelected(item) {
        if (['PG','PR','SPG','SPR','RPG','RPR'].includes(item.flag)) {
          this.manageTabButton('CRT',true);
          this.$refs.Modal.showModal();
        } else {
          this.manageTabButton('UPT',true);
          this.$refs.Modal.showModal();
        }
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
