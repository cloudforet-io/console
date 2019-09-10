<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <BaseModal ref="IVDC001_EditModal"
                   :title="dataCenterModalTitle"
                   :centered="true"
                   :hide-footer="true"
        >
          <template #contents>
            <BaseTabNav
              ref="IVDC001_EditTab"
              :fill="true"
              :nav-tabs="modalTabs"
              :keep-alive="true"
              :is-footer-visible="true"
              :selected-data="selectedData"
              :is-creatable="createProcess"
              :is-updatable="updateProcess"
              @create="createProsProcess"
              @update="updateDataCenter"
              @close="closeSelected"
            />
          </template>
        </BaseModal>
      </div>
    </div>

    <BaseTree ref="IVDC001_DataCenterTree"
              :tree-prop="treeData"
              :context-init="isInitializing"
              :con-text-obj="contextProp"
              :tree-type="'DATA_CENTER'"
              @selected="NodeSelected"
              @edited="editSelected"
              @delete="deletedSelectedOnTree"
              @noCacheDrop="moveDataCenter"
              @toggled="getNextLayerOnTree"
    >
      <template #treeSubPanel>
        <BaseTabNav
          ref="IVDC001_TreeSubPanel"
          :fill="false"
          :nav-tabs="tabs"
          :selected-data="selectedData"
          :keep-alive="true"
          :is-footer-visible="false"
          :tab="tab"
        />
      </template>
    </BaseTree>
  </div>
</template>

<script>


import dataCenterEditPopupName from '@/views/inventory/data_center/IVDC_002_DataCenterEditPopupName';
import dataCenterEditPopupTag from '@/views/inventory/data_center/IVDC_003_DataCenterEditPopupTag';
import dataCenterSummary from '@/views/inventory/data_center/IVDC_004_DataCenterSummary';
import dataCenterAdmin from '@/views/inventory/data_center/IVDC_005_DataCenterAdmin';

import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTree from '@/components/base/tree/BATR_001_BaseTree';

const tabs = [
    {
        name: 'summary',
        isSelected: true,
        tabIcon: 'icon-calculator',
        title: 'SUMMARY',
        component: dataCenterSummary
    },
    {
        name: 'admin',
        isSelected: false,
        tabIcon: 'icon-user',
        title: 'MEMBER',
        component: dataCenterAdmin
    }
];

const modalTabs = [
    {
        tabIcon: 'icon-calculator',
        title: 'DEFAULT',
        component: dataCenterEditPopupName
    },
    {
        tabIcon: 'icon-user',
        title: 'TAGS',
        component: dataCenterEditPopupTag
    }
];

export default {
    name: 'DataCenter',
    components: {
        BaseTabNav,
        BaseTree,
        BaseModal
    },
    data() {
        return {
            contextProp: {
                Executor: ['CRG', 'URG', 'CZN', 'UZN', 'CPL', 'UPL', 'RMS'],
                ContextVisible  :[false, false, false, false, false, false],
                icons: ['fal fa-globe-americas'
                    ,'fal fa-globe-asia'
                    ,'fas fa-clouds-sun'
                    ,'fal fa-clouds-moon'
                    ,'fas fa-server'
                    ,'fad fa-server'
                    ,'fal fa-trash'
                ],
                Msg: [
                    ['TREE_TYPE.CREATE', 'TREE_TYPE.REGION'],
                    ['TREE_TYPE.UPDATE', 'TREE_TYPE.REGION'],
                    ['TREE_TYPE.CREATE', 'TREE_TYPE.ZONE'],
                    ['TREE_TYPE.UPDATE', 'TREE_TYPE.ZONE'],
                    ['TREE_TYPE.CREATE', 'TREE_TYPE.POOL'],
                    ['TREE_TYPE.UPDATE', 'TREE_TYPE.POOL'],
                    ['TREE_TYPE.DELETE', 'TREE_TYPE.PROJECT']
                ]
            },
            tab: tabs[0].component,
            tabs: tabs,
            modalTab: modalTabs[0].component,
            modalTabs: modalTabs,
            selectedData: {}, //Selected Data => Selected node data & flag
            processData: {}, //Process Data => data that has to be taken by action
            createProcess: false,
            updateProcess: false,
            treeData: [],
            dataCenterModalTitle: 'Edit a DataCenter',
            modalVisible: false,
            lastEvent: 'Right-Click to open context menus on tree.',
            isInitializing: false
        };
    },
    created (){
        console.log('This is Test for Dev Server');
        this.listDataCenter();
    },
    methods: {
        NodeSelected(item) {
            this.selectedData = item;
        },
        async listDataCenter() {
            await this.$axios.post('/inventory/data-center/tree', {
                domain_id: sessionStorage.domainId,
                item_type: 'ROOT',
                sort: {
                    'key': 'name'
                }
            }).then((response) => {
                const responseData = this.treeDataHandler(response.data, 'DATA_CENTER');
                this.treeData = responseData;

                if (this.treeData.length === 1 && !this.isEmpty(this._.get(this.treeData[0],'data.init'))) {
                    this.isInitializing = true;
                }
                console.log(this.treeData);
            }).catch((error) => {
                console.error(error);
            });
        },
        editSelected(item) {
            this.selectedData = item;
            if (['CRG', 'CZN', 'CPL'].includes(item.flag)) {
                this.updateProcess = !true;
                this.createProcess = true;
                this.dataCenterModalTitle = item.flag === 'CRG' ? this.tr('TREE_TYPE.CREATE', [this.tr('TREE_TYPE.REGION')]) : item.flag === 'CZN' ?
                    this.tr('TREE_TYPE.CREATE', [this.tr('TREE_TYPE.ZONE')]):this.tr('TREE_TYPE.CREATE', [this.tr('TREE_TYPE.POOL')]);
            } else {
                this.createProcess = !true;
                this.updateProcess = true;
                this.dataCenterModalTitle = item.flag === 'URG' ? this.tr('TREE_TYPE.UPDATE', [this.tr('TREE_TYPE.REGION')]) : item.flag === 'UZN' ?
                    this.tr('TREE_TYPE.UPDATE', [this.tr('TREE_TYPE.ZONE')]):this.tr('TREE_TYPE.UPDATE', [this.tr('TREE_TYPE.POOL')]);
            }
            this.$refs.IVDC001_EditModal.showModal();
        },
        validateDataCenter (){
            let isDefaultValidated = false;
            let isTagValidated = false;
            let params = {};

            const tabChildren = this.$refs.IVDC001_EditTab.$children;
            let childrenIdx = this.getRightChildrenIndex(tabChildren, ['DataCenterEditPopUpName','DataCenterEditPopUpTag']);

            if (tabChildren[childrenIdx[0]].validateDataCenter()){
                isDefaultValidated = true;
                params['name'] = tabChildren[childrenIdx[0]]._data.rezeplName;
            }
            if (childrenIdx.length > 1){
                if (tabChildren[childrenIdx[1]].$refs.IVDC003_DataCenterTag.validate()) {
                    params['tags'] = tabChildren[childrenIdx[1]].$refs.IVDC003_DataCenterTag.tags;
                    isTagValidated = true;
                }
            } else {
                isTagValidated = true;
            }

            if (this.$refs.IVDC001_EditTab.selectedTab.title == 'DEFAULT'){
                if (isDefaultValidated && !isTagValidated){
                    this.$refs.IVDC001_EditTab.selectedTab = this.modalTabs[1];
                }
            } else {
                if (isTagValidated && !isDefaultValidated){
                    this.$refs.IVDC001_EditTab.selectedTab = this.modalTabs[0];
                }
            }
            return (isTagValidated && isDefaultValidated) ? params : null;
        },
        async getNextLayerOnTree (nodeObj){
            let childrenNode = [];
            const selected = this.isEmpty(nodeObj.treeV.getSelected()[0]) ? nodeObj.node: nodeObj.treeV.getSelected()[0];
            const path = selected.path;
            const dataParam = nodeObj.node.data;
            dataParam['is_cached'] = true;
            let param = {
                item_type: this._.get(nodeObj.node, 'data.item_type'),
                item_id: this._.get(nodeObj.node, 'data.id'),
                domain_id: sessionStorage.domainId
            };
            await this.$axios.post('/inventory/data-center/tree', param).then((response) => {
                childrenNode = this.getSelectedNodeArr(response.data.items, 'DATA_CENTER');

                nodeObj.treeV.updateNode(path, { data: dataParam });
                if (!this.isEmpty(childrenNode)){
                    childrenNode.forEach(curItem =>{
                        nodeObj.treeV.insert({ node: selected, placement: 'inside' }, curItem);
                    });
                }
                console.log('Tree Data', this.treeData);
            }).catch((error) => {
                console.error(error);
            });

        },
        async createProsProcess(item) {
            const flag = this.selectedData.flag;
            const treeV = this.isEmpty(item.tree) ? this.selectedData.tree : item.tree;
            if ('CRG' === flag) {
                this.createRegion(item, flag, treeV);
            } else {
                this.createZoneAndPool(item, flag, treeV);
            }
        },
        async createRegion(items, flag, tree) {
            let param = this.validateDataCenter();
            if (param){
                param['domain_id'] = sessionStorage.domainId;
                param['is_root']= true;
                await this.$axios.post('/inventory/region/create', param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)){
                        const InitDTCenter = { id: responseData.region_id, item_type:'REGION', name: param.name };
                        let newNode = this.getSelectedNode(InitDTCenter, 'DATA_CENTER');
                        tree.insert({ node: tree.getSelected()[0], placement: 'after' }, newNode);
                        if (this.isInitializing){
                            tree.remove([tree.getFirstNode()].map(node => node.path));
                            this.isInitializing = false;
                        }
                    }
                }).catch((error) => {
                    console.error(error);
                });
                this.$refs.IVDC001_EditModal.hideModal();
            }
        },
        async createZoneAndPool(items, flag, tree) {
            let param = this.validateDataCenter();
            if (param){
                const selected = tree.getSelected()[0];
                const key = flag === 'CZN' ? 'region_id' : 'zone_id';
                const url = flag === 'CZN' ? '/inventory/zone/create' : '/inventory/pool/create';
                param[key] = selected.data.id;
                param['domain_id'] = sessionStorage.domainId;

                await this.$axios.post(url, param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)){
                        const InitDTCenter = { id: flag === 'CZN' ?  responseData.zone_id : responseData.pool_id,
                            item_type: flag === 'CZN' ? 'ZONE' : 'POOL',
                            name: param.name };
                        let newNode = this.getSelectedNode(InitDTCenter, 'DATA_CENTER');
                        this.applyActionOnScreen(items, flag, tree,{ node: newNode, placement: 'inside' });
                    }
                }).catch((error) => {
                    console.error(error);
                });
                this.$refs.IVDC001_EditModal.hideModal();
            }
        },
        async updateDataCenter(items) {
            const itemType = this._.get(items.tree.getSelected()[0],'data.item_type');
            const itemId = this._.get(items.tree.getSelected()[0],'data.id');
            const url = itemType === 'REGION' ? '/inventory/region/update': itemType === 'ZONE' ? '/inventory/zone/update' : '/inventory/pool/update';
            const key = itemType === 'REGION' ? 'region_id': itemType === 'ZONE' ? 'zone_id' : 'pool_id';
            let param = this.validateDataCenter();

            if (!this.isEmpty(param)){
                param[key] = itemId;
                await this.$axios.post(url, param).then((response) => {
                    if (response.data[key] === itemId) {
                        const treeV = items.tree;
                        const path = treeV.getSelected()[0].path;
                        const updateSummary = this.$refs.IVDC001_TreeSubPanel.$children;
                        const updateIndex = this.getRightChildrenIndex(updateSummary,'DataCenterSummary');
                        updateSummary[updateIndex].setInitData();
                        treeV.updateNode(path, { title: param.name });
                        this.$refs.IVDC001_EditModal.hideModal();
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        },
        async deletedSelectedOnTree (pramTree){
            const itemType = this._.get(pramTree.tree.getSelected()[0],'data.item_type');
            const itemId = this._.get(pramTree.tree.getSelected()[0],'data.id');
            const url = itemType === 'REGION' ? '/inventory/region/delete': itemType === 'ZONE' ? '/inventory/zone/delete' : '/inventory/pool/delete';
            const key = itemType === 'REGION' ? 'region_id': itemType === 'ZONE' ? 'zone_id' : 'pool_id';
            let passParam = { domain_id: sessionStorage.domainId };
            passParam[key] = itemId;
            await this.$axios.post(url, passParam).then((response) => {
                const responseData = response.data;
                console.log(responseData);
                if (this.isEmpty(responseData)){
                    pramTree.tree.remove(pramTree.path);
                    this.$alertify.success('Selected Item is Succefully deleted.');
                    this.tr('MSG.DELETE_SUCC',[this.tr(`TREE_TYPE.${itemType}`),itemId]);
                    if (this.treeData.length === 1) {
                        this.isInitializing = true;
                        this.treeData = [{ title: '! Please, Right Click me',
                            isLeaf: true,
                            data: {
                                init: true
                            }}];
                    }
                }
            }).catch((error) => {
                console.error(error);
                if (error.data.error.code.includes('ERROR_EXIST_CHILD')) {
                    this.$alertify.error('Item has child, Please delete Child first.');
                }
            });
        },
        async moveDataCenter(items) {

            const fromItem = items.nodes[0];
            const toItem = items.position.node;
            let param = {};
            const url = `/inventory/${fromItem.data.item_type.toLowerCase()}/update`;

            const keySrouce = `${fromItem.data.item_type.toLowerCase()}_id`;
            const keyTo = `${toItem.data.item_type.toLowerCase()}_id`;
            param[keySrouce] = fromItem.data.id;
            param[keyTo] = toItem.data.id;

            await this.$axios.post(url, param).then((response) => {
                const responseData = response.data;
                if (!this.isEmpty(responseData)){
                    console.log('Item successfully moved.', responseData);
                }
            }).catch((error) => {
                console.error(error);
            });

            debugger;

            if (!items.position.node.data.is_cached){
                if (items.isCanceled) {
                    items.position.node.path[items.position.node.path.length-1] = items.position.node.path[items.position.node.path.length-1]-1;
                    items.treeV.select(items.position.node.path, { addToSelection: false });
                }
                items.treeV.updateNode(items.position.node.path, { isExpanded: true });
                this.getNextLayerOnTree({ treeV: items.treeV, node: items.position.node });
            }
        },
        async applyActionOnScreen(items, flag, tree, data) {
            const selected = tree.getSelected()[0];
            const path = selected.path;
            if (!selected.isExpanded) {
                if (selected.data.is_cached) {
                    tree.insert({ node: tree.getSelected()[0], placement: data.placement }, data.node);
                    tree.updateNode(path, { isExpanded: true });
                } else {
                    this.getNextLayerOnTree({ treeV: tree, node: selected });
                    tree.updateNode(path, { isExpanded: true });
                }
            } else {
                tree.insert({ node: tree.getSelected()[0], placement: data.placement }, data.node);
            }
        },
        async closeSelected(){
            this.$refs.IVDC001_EditModal.hideModal();
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
