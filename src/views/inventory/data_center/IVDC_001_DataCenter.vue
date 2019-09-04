<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <BaseModal ref="Modal"
                   name="EditModal"
                   :title="dataCenterModalTitle"
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
                      @create="createDataCenter"
                      @update="updateDataCenter"
                      @close="$refs.Modal.hideModal()"
            >
              <template #ModaltabContentsPanel />
            </BaseTabs>
          </template>
        </BaseModal>
      </div>
    </div>

    <BaseTree :tree-prop="treeData"
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



import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';
import BaseTabs from '@/components/base/tab/BATA_001_BaseTab';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTree from '@/components/base/tree/BATR_001_BaseTree';

import dataCenterSummary from '@/views/inventory/data_center/IVDC_004_DataCenterSummary.vue';
import dataCenterAdmin from '@/views/inventory/data_center/IVDC_005_DataCenterAdmin.vue';
import dataCenterAudit from '@/views/inventory/data_center/IVDC_007_DataCenterAudit.vue';


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
        name: 'summary',
        isSelected: true,
        tabIcon: 'icon-calculator',
        title: 'SUMMARY',
        component: dataCenterSummary
    },
    {
        name: 'member',
        isSelected: false,
        tabIcon: 'icon-user',
        title: 'MEMBER',
        component: dataCenterAdmin
    },
    {
        name: 'audit',
        isSelected: false,
        tabIcon: 'icon-pie-charts',
        title: 'AUDIT',
        component: dataCenterAudit
    }
];

const dataCenterEditPopupName = () => import('@/views/inventory/data_center/IVDC_002_DataCenterEditPopupName');
const dataCenterEditPopupTag = () => import('@/views/inventory/data_center/IVDC_003_DataCenterEditPopupTag');

const modalTab = [
    {
        tabIcon: 'icon-calculator',
        title: 'DEFAULT',
        updatable: true,
        creatable: true,
        component: dataCenterEditPopupName
    },
    {
        tabIcon: 'icon-user',
        title: 'TAGS',
        updatable: true,
        creatable: true,
        component: dataCenterEditPopupTag
    }
];

export default {
    name: 'DataCenter',
    components: {
        BaseTabNav,
        BaseTabs,
        BaseTree,
        BaseModal
    },
    props: {

    },
    data () {
        return {
            tab: tabs[0].component,
            selectedData: {}, //Selected Data => Selected node data & flag
            processData: {}, //Process Data => data that has to be taken by action
            createProcess: false,
            updateProcess: false,
            treeData: sampleNode,
            dataCenterModalTitle: 'Edit a Region/Zone',
            modalVisible: false,
            lastEvent: 'Right-Click to open context menus on tree.',
            tabs: tabs,
            modalTabs: modalTab
        };
    },
    created () {

    },
    mounted: function () {

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
                this.dataCenterModaltitle = (title) ? 'Create a Region/Zone Group' : 'Create a Region/Zone';
                this.updateProcess = !state;
                this.createProcess = state;
            } else if (flag === 'UPT') {
                this.createProcess = !state;
                this.updateProcess = state;
            } else {
                this.consoleLogEnv('Sp cases');
            }
        },
        async updateDataCenter (item) {
            this.consoleLogEnv('item', item);
            const treeV = item.tree;
            const path = treeV.getSelected()[0].path;
            let tabData = this.$refs.EditTab.tabContentData;
            treeV.updateNode(path, { title: tabData.dataCenterProp.dataCenterName });
            tabData.dataCenterProp.dataCenterName = null;
        //TODO:: Simulate gRPC Modules on BACK_END
            this.$refs.Modal.hideModal();
        },
        createDataCenter  (item) {
            this.consoleLogEnv('item', item);
            const flag = this.selectedData.selectedItem.flag;
            const treeV = this.isEmpty(item.tree) ? this.selectedData.selectedItem.tree : item.tree;
            let tabData = this.$refs.EditTab.tabContentData;

            let newNode = {
                title: tabData.dataCenterProp.dataCenterName,
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
            tabData.dataCenterProp.dataCenterName = null;
            tabData.dataCenterProp.dataCenterId = null;

            this.$refs.Modal.hideModal();
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
