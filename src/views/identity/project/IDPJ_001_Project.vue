<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <BaseModal ref="EditModal"
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
                      @close="$refs.EditModal.hideModal()"
            >
              <template #ModaltabContentsPanel />
            </BaseTabs>
          </template>
        </BaseModal>
      </div>
    </div>

    <BaseTree ref="projectTree"
              :tree-key="treeKey"
              :tree-prop="treeData"
              :context-init="isInitializing"
              @selected="NodeSelected"
              @edited="editSelected"
    >
      <template #treeSubPanel>
        <BaseTabNav
          :fill="false"
          :nav-tabs="tabs"
          :keep-alive="true"
          :is-footer-visible="false"
          :tab="tab"
        />
      </template>
    </BaseTree>
  </div>
</template>

<script>

import projectSummary from './IDPJ_004_ProjectSummary.vue';
import projectAudit from './IDPJ_007_ProjectAudit.vue';
import projectMember from './IDPJ_005_ProjectMember.vue';

import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';
import BaseTabs from '@/components/base/tab/BATA_001_BaseTab';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTree from '@/components/base/tree/BATR_001_BaseTree';

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
        name: 'summary',
        isSelected: true,
        tabIcon: 'icon-calculator',
        tabTitle: 'SUMMARY',
        component: projectSummary
    },
    {
        name: 'member',
        isSelected: false,
        tabIcon: 'icon-user',
        tabTitle: 'MEMBER',
        component: projectMember
    },
    {
        name: 'audit',
        isSelected: false,
        tabIcon: 'icon-pie-charts',
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
        BaseTabs,
        BaseTree,
        BaseModal
    },
    props: {

    },
    data() {
        return {
            treeKey: 1,
            tab: tabs[0].component,
            selectedData: {}, //Selected Data => Selected node data & flag
            processData: {}, //Process Data => data that has to be taken by action
            createProcess: false,
            updateProcess: false,
            treeData: [],
            projectModalTitle: 'Edit a Project',
            modalVisible: false,
            lastEvent: 'Right-Click to open context menus on tree.',
            tabs: tabs,
            modalTabs: modalTab,
            isInitializing: false
        };
    },
    created (){
        this.listProject();
        this.treeKey = this.treeKey > 0 ? 0 : 1;
    },
    methods: {
        async listProject() {
            await this.$axios.post('/identity/project/tree', {
                item_id: null,
                item_type: 'ROOT',
                sort: {
                    'key': 'name'
                }
            }).then((response) => {
                const responseData = this.treeDataHandler(response.data, 'PROJECT');
                this.treeData = responseData;
                //Note: Initialize Project trees and then display only a context, This must be included as well.
                if (this.treeData.length === 1 && !this.isEmpty(this._.get(this.treeData[0],'data.init'))) {
                    this.isInitializing = true;
                }

                console.log(this.treeData);
            }).catch((error) => {
                console.error(error);
            });
        },
        NodeSelected(item) {
            this.lastEvent = 'Selected Item : ' + item[0].title;
        },
        editSelected(item) {
                  /*  TODO :: Please Add More Flags if needed.
                   *  CRT => Create
                   *  UPT => Update
                   *  DEL => Delete
                   ****************
                   *  NG => Node Group
                   *  NR => *
                   *  SNG => Selected Project Group
                   *  SND => Selected Project
                   *  RNG => Root Project Group
                   *  RND => Root Project
                   */
            if (['NG', 'ND', 'SNG', 'SNR', 'RNG', 'RND'].includes(item.flag)) {
                const title = (item.flag.indexOf('NG') > 0);
                this.selectedData['selectedItem'] = item;
                this.manageTabButton('CRT', true, title);
                this.$refs.EditModal.showModal();
            } else {
                this.selectedData['selectedItem'] = item;
                this.manageTabButton('UPT', true);
                this.selectedData = item;
                this.$refs.EditModal.showModal();
            }
        },
        manageTabButton(flag, state, title) {
            if (flag === 'CRT') {
                this.projectModaltitle = (title) ? 'Create a Project Group' : 'Create a Project';
                this.updateProcess = !state;
                this.createProcess = state;
            } else if (flag === 'UPT') {
                this.createProcess = !state;
                this.updateProcess = state;
            }
        },
        async updateProject(items) {
            this.consoleLogEnv('item', items);
            const treeV = items.tree;
            const path = treeV.getSelected()[0].path;
            let tabData = this.$refs.EditTab.tabContentData;
            treeV.updateNode(path, { title: tabData.projectProp.projectName });
            tabData.projectProp.projectName = null;
                //TODO:: Simulate gRPC Modules on BACK_END
            this.$refs.EditModal.hideModal();
        },
        async createProject(items) {
            debugger;
            this.consoleLogEnv('item', items);
            const flag = this.selectedData.selectedItem.flag;
            const treeV = this.isEmpty(items.tree) ? this.selectedData.selectedItem.tree : items.tree;
            const selected = treeV.getSelected()[0];
            let tabData = this.$refs.EditTab.tabContentData;

            let creationUrl = null;

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
            if (flag == 'SNG') {
                placement = 'inside';
            } else if (flag == 'SND') {
                newNode['isLeaf'] = true;
                placement = 'inside';
            } else if (flag == 'RNG') {
                placement = 'before';
            } else {
                placement = 'before';
                newNode['isLeaf'] = true;
            }

            //Initialization for Project Group, Origin
            if (this.isInitializing) {
                creationUrl = '/identity/project-group/create';
            } else {
                creationUrl = '/identity/project-group/create';
            }

            //treeV.insert({ node: treeV.getSelected()[0], placement: placement }, newNode);
            tabData.projectProp.projectName = null;
            tabData.projectProp.projectId = null;


            this.$refs.EditModal.hideModal();
        },
        applyOnTreeView (tree, placement, newNode){

        }
    }
};
</script>

<style lang="scss" scoped>
    #scrollspy-example {
        position: relative;
        height: 200px;
        overflow-y: scroll;
        border: 1px solid blue;
    }
</style>
