<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <BaseModal id="IDPJ001_Project_Edit_Modal"
                   ref="Modal"
                   :name="'EditModal'"
                   :title="projectModalTitle"
                   :centered="true"
                   :hide-footer="true"
        >
          <template #contents>
            <BaseTabs is="BaseTabs"
                      ref="EditTab"
                      :key="tabs.path"
                      :tabs="modalTabs"
                      :fill="true"
                      :selected-data="selectedData"
                      :is-creatable="createProcess"
                      :is-updatable="updateProcess"
                      :is-footer-visible="true"
                      @create="createProject"
                      @update="updateProject"
            >
              <template #ModaltabContentsPanel />
            </BaseTabs>
          </template>
        </BaseModal>
      </div>
    </div>

    <BaseTree ref="projectTree"
              :tree-prop="treeData"
              @selected="NodeSelected"
              @edited="editSelected"
    >
      <template #treeSubPanel>
        <BaseTabNav
          :fill="false"
          :nav-tabs="tabs"
          :keep-alive="true"
          :is-footer-visible="false"
        />
      </template>
    </BaseTree>
  </div>
</template>

<script>

import projectSummary from './IDPJ_004_ProjectSummary.vue';
import projectAudit from './IDPJ_007_ProjectAudit.vue';
import projectMember from './IDPJ_005_ProjectMember.vue';

import BaseTabNav from '@/component/base/tab/BATA_002_BaseTabNav';
import BaseTabs from '@/component/base/tab/BATA_001_BaseTab';
import BaseModal from '@/component/base/modal/BAMO_001_BaseModal';
import BaseTree from '@/component/base/tree/BATR_001_BaseTree';

import { api } from '@/setup/api';

const sampleNode = [
  {
    'title': 'Item1',
    'isLeaf': true
  },
  {
    'title': 'Item2',
    'isLeaf': true,
    'data': {
      'visible': false
    }
  },
  {
    'title': 'Folder1',
    'isSelected': false,
    'isExpanded': false
  },
  {
    'title': 'Folder2',
    'isExpanded': false,
    'children': [
      {
        'title': 'Item3',
        'isLeaf': true
      },
      {
        'title': 'Item4',
        'isLeaf': true
      },
      {
        'title': 'Folder3',
        'children': [
          {
            'title': 'Item5',
            'isLeaf': true
          }
        ]
      }
    ],
    'isSelected': true
  },
  {
    'title': 'Folder5',
    'isExpanded': false
  },
  {
    'title': 'Item6',
    'isLeaf': true
  },
  {
    'title': 'Item7',
    'isLeaf': true,
    'data': {
      'visible': false
    }
  },
  {
    'title': 'Folder6',
    'children': [
      {
        'title': 'Folder7',
        'children': [
          {
            'title': 'Item8',
            'isLeaf': true
          },
          {
            'title': 'Item9',
            'isLeaf': true
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
  data: { visible: false }
};

let NodePG = {
  title: '',
  isLeaf: false,
  children: null,
  isExpanded: true,
  isSelected: true,
  isDraggable: true,
  isSelectable: true,
  data: { visible: false }
};
const tabs = [
  {
    tabTitle: 'SUMMARY',
    component: projectSummary
  },
  {
    tabTitle: 'MEMBER',
    component: projectMember
  },
  {
    tabTitle: 'AUDIT',
    component: projectAudit
  }
];

const projectEditPopupName = () => import('./IDPJ_002_ProjectEditPopupName');
const projectEditPopupTag = () => import('./IDPJ_003_ProjectEditPopupTag');

const modalTab = [
  {
    tabIcon: 'icon-calculator',
    tabTitle: 'DEFAULT',
    updatable: true,
    creatable: true,
    component: projectEditPopupName
  },
  {
    tabIcon: 'icon-user',
    tabTitle: 'TAGS',
    updatable: true,
    creatable: true,
    component: projectEditPopupTag
  }
];

export default {
  name: 'Project',
  components: {
    BaseTabNav,
    projectEditPopupName,
    projectEditPopupTag,
    projectMember,
    projectSummary,
    projectAudit,
    BaseTabs,
    BaseTree,
    BaseModal
  },
  props: {

  },
  data () {
    return {
      /*  Selected Data => Selected node data & flag
         */
      selectedData: {},
      /*  Process Data => data that has to be taken by action
         */
      processData: {},
      createProcess: false,
      updateProcess: false,
      treeData: sampleNode,
      projectModalTitle: 'Edit a Project',
      modalVisible: false,
      lastEvent: 'Right-Click to open context menus on tree.',
      tabs: tabs,
      modalTabs: modalTab
    };
  },
  created () {

  },
  mounted: function () {
    if (!this.sideBarIsMinimized) {
      this.sideBarMiniMaxControl();
    }
  },
  methods: {
    NodeSelected (item) {
      this.lastEvent = 'Selected Item : ' + item[0].title;
    },
    editSelected (item) {
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
      if (['PG', 'PR', 'SPG', 'SPR', 'RPG', 'RPR'].includes(item.flag)) {
        const title = (item.flag.indexOf('PG') > 0);
        this.selectedData['selectedItem'] = item;
        this.manageTabButton('CRT', true, title);
        this.$refs.Modal.showModal();
      } else {
        this.selectedData['selectedItem'] = item;
        this.manageTabButton('UPT', true);
        this.selectedData = item;
        this.$refs.Modal.showModal();
      }
    },
    manageTabButton (flag, state, title) {
      if (flag === 'CRT') {
        this.projectModaltitle = (title) ? 'Create a Project Group' : 'Create a Project';
        this.updateProcess = !state;
        this.createProcess = state;
      } else if (flag === 'UPT') {
        this.createProcess = !state;
        this.updateProcess = state;
      } else {

      }
    },
    async updateProject (items) {
      debugger;
      console.log('item', items);
      const treeV = items.tree;
      const path = treeV.getSelected()[0].path;
      let tabData = this.$refs.EditTab.tabContentData;
      treeV.updateNode(path, { title: tabData.projectProp.projectName });
      tabData.projectProp.projectName = null;
      // TODO:: Simulate gRPC Modules on BACK_END
      this.$refs.Modal.hideModal();
    },
    createProject (items) {
      console.log('item', items);

      const flag = this.selectedData.selectedItem.flag;
      const treeV = this.isEmpty(items.tree) ? this.selectedData.selectedItem.tree : items.tree;
      let tabData = this.$refs.EditTab.tabContentData;

      let newNode = {
        title: tabData.projectProp.projectName,
        isLeaf: false,
        children: null,
        isExpanded: false,
        isSelected: true,
        isDraggable: true,
        isSelectable: true,
        data: { visible: false }
      };

      let placement = '';
      if (flag == 'SPG') {
        placement = 'inside';
      } else if (flag == 'SPR') {
        newNode['isLeaf'] = true;
        placement = 'inside';
      } else if (flag == 'RPG') {
        placement = 'before';
      } else {
        placement = 'before';
        newNode['isLeaf'] = true;
      }

      treeV.insert({ node: treeV.getSelected()[0], placement: placement }, newNode);
      tabData.projectProp.projectName = null;
      tabData.projectProp.projectId = null;

      this.$refs.Modal.hideModal();
    }
  }
};
</script>

<style lang="scss" scoped>
  // #scrollspy-example {
  //   position: relative;
  //   height: 200px;
  //   overflow-y: scroll;
  //   border: 1px solid blue;
  // }
</style>
