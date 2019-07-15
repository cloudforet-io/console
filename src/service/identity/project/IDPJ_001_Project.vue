<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <b-card>
          <div>
            <div class="d-flex align-items-center ml-2">
              <b>{{ lastEvent }} </b>
            </div>
                <BaseModal id='IDPJ_001_Project_Edit_Modal'
                         ref="Modal"
                         :name="'EditModal'"
                         :title="projectModaltitle"
                         :centered="true"
                         :hide-footer="true" >
                  <template #contents>
                    <BaseTabs ref="EditTab"
                              is="BaseTabs"
                              :tabs="projTabs"
                              :tabIndex="projIndex"
                              :key="tabs.path"
                              :fill="true"
                              :selectedData="selectedData"
                              :isCreatable="createProcess"
                              :isUpdatable="updateProcess"
                              :isfooterVisible="true"
                              @create="createProject"
                              @update="updateProject"
                              >
                         <template  #ModaltabContentsPanel>
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
          <BaseTabs is="BaseTabs"
                    id="ContentsBaseTabs"
                    :tabs="tabs"
                    :tabIndex="tabIndex"
                    :key="tabs.tabTitle">
            <keep-alive>
              <template #tabContentsPanel
                        ref="treeContents">
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

  let NodePR = {
  title: '',
  isLeaf: true,
  children: null,
  isExpanded: true,
  isSelected: true,
  isDraggable: true,
  isSelectable: true,
  data: {visible:false}
  };

  let NodePG = {
    title: '',
    isLeaf: false,
    children: null,
    isExpanded: true,
    isSelected: true,
    isDraggable: true,
    isSelectable: true,
    data: {visible:false}
  };

  const projectEditPopupName = () => import ('./IDPJ_002_ProjectEditPopupName')
  const projectEditPopupTag = () => import('./IDPJ_003_ProjectEditPopupTag')
  import projectAudit from './IDPJ_007_ProjectAudit.vue';
  import projectMember from './IDPJ_005_ProjectMember.vue';
  import projectSummary from './IDPJ_004_ProjectSummary.vue';

  import BaseTabs from '@/component/base/tab/BATA_001_BaseTab'
  import BaseModal from '@/component/base/modal/BAMO_001_BaseModal'
  import BaseTree from '@/component/base/tree/BATR_001_BaseTree'

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
    created(){

    },
    data() {
      return {
        selectedData: {},
        processData: {},
        createProcess: false,
        updateProcess: false,
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
      NodeSelected(item) {
        this.lastEvent = "Selected Item : " + item[0].title;
      },
      editSelected(item) {
        /*  TODO :: Please Add More Flags if needed.
         *  CRT => Create
         *  UPT => Update
         *  DEL => Delete
         ****************
         *  PG => Project Group
         *  PR => Project
         *  SPG => Selected Project Group
         *  SPR => Selected Project
         *  RPG => Root Project Group
         *  RPR => Root Project
         */
        if (['PG','PR','SPG','SPR','RPG','RPR'].includes(item.flag)) {
          const title = (item.flag.indexOf('PG')>0) ? true: false
          this.selectedData['selectedItem'] = item
          this.manageTabButton('CRT',true, title);
          this.$refs.Modal.showModal();

        } else {
          this.selectedData['selectedItem'] = item
          this.manageTabButton('UPT',true);
          this.selectedData = item;
          this.$refs.Modal.showModal();
        }
      },
      manageTabButton(flag,state, title){
        if (flag==='CRT') {
          this.projectModaltitle = (title) ? 'Create a Project Group': 'Create a Project';
          this.updateProcess = !state;
          this.createProcess =  state;

        } else if(flag==='UPT'){
          this.createProcess = !state;
          this.updateProcess = state;

        } else {

        }
      },
      async updateProject(items){
        console.log('item', items);
        const treeV = items.tree
        const path = treeV.getSelected()[0].path;
        let tabData = this.$refs.EditTab.tabContentData;
        treeV.updateNode(path, {title: tabData.projectProp.projectName});
        tabData.projectProp.projectName = null;
        //TODO:: Simulate gRPC Modules on BACK_END
        this.$refs.Modal.hideModal()

      },
      createProject(items){
        console.log('item', items);

        const flag = this.selectedData.selectedItem.flag;
        const treeV = this.isEmpty(items.tree) ? this.selectedData.selectedItem.tree: items.tree;
        let tabData = this.$refs.EditTab.tabContentData;

        let newNode = {
          title: tabData.projectProp.projectName,
          isLeaf: false,
          children: null,
          isExpanded: false,
          isSelected: true,
          isDraggable: true,
          isSelectable: true,
          data: {visible:false}
        };

          let placement = "";
          if (flag=='SPG'){
            placement = 'inside';
          }else if(flag=='SPR'){
            newNode['isLeaf'] = true;
            placement = 'inside';
          }else if(flag=='RPG'){
            placement = 'before';
          }else{
            placement = 'before';
            newNode['isLeaf'] = true;
          };

        treeV.insert({node: treeV.getSelected()[0],placement: placement}, newNode);
        tabData.projectProp.projectName = null;
        tabData.projectProp.projectId = null;

        this.$refs.Modal.hideModal()
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
