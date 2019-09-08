<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <BaseModal ref="IVDC001_EditModal"
                   :title="dataCenterModalTitle"
                   :centered="true"
                   :hide-footer="true">
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
                const responseData = this.treeDataHandler(response.data, { is_root: true });
                this.treeData = responseData;
          //Note: Initialize DataCenter trees and then display only a context, This must be included as well.
                if (this.treeData.length === 1 && !this.isEmpty(this._.get(this.treeData[0],'data.init'))) {
                    this.isInitializing = true;
                }
                console.log(this.treeData);
            }).catch((error) => {
                console.error(error);
            });
        },
        editSelected(item) {
        /*******************************************
         * TODO :: Please Add More Flags if needed.
         *  CRT => Create
         *  UPT => Update
         *  DEL => Delete
         ****CRT***********************************
         *  NG => Node Group
         *  SNG => Selected DataCenter Group
         *  SND => Selected DataCenter
         *  RNG => Root DataCenter Group
         *  RND => Root DataCenter
         ****UPT***********************************
         *  SN => Selected Node Group or Node
         */
            if (['SN'].includes(item.flag)) {
                this.selectedData = item;
                this.manageTabButton('UPT', true);
                this.selectedData = item;
                this.$refs.IVDC001_EditModal.showModal();
            } else {
                const title = (item.flag.indexOf('NG') > -1);
                this.selectedData = item;
                this.manageTabButton('CRT', true, title);
                this.$refs.IVDC001_EditModal.showModal();
            }
        },
        manageTabButton(flag, state, title) {
            if (flag === 'CRT') {
                this.dataCenterModaltitle = (title) ? 'Create a DataCenter Group' : 'Create a DataCenter';
                this.updateProcess = !state;
                this.createProcess = state;
            } else if (flag === 'UPT') {
                this.createProcess = !state;
                this.updateProcess = state;
            }
        },
        validateDataCenter (){
            let isDefaultValidated = false;
            let isTagValidated = false;
            let params = {};

            const tabChildren = this.$refs.IVDC001_EditTab.$children;
            let childrenIdx = this.getRightChildrenIndex(tabChildren, ['DataCenterEditPopUpName','DataCenterEditPopUpTag']);

            if (tabChildren[childrenIdx[0]].validateDataCenter()){
                isDefaultValidated = true;
                params['name'] = tabChildren[childrenIdx[0]]._data.dataCenterName;
            }
            if (childrenIdx.length > 1){
                if (tabChildren[childrenIdx[1]].$refs.IDPJ003_DataCenterTag.validate()) {
                    params['tags'] = tabChildren[childrenIdx[1]].$refs.IDPJ003_DataCenterTag.tags;
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
            this.consoleLogEnv('Getting a layer On Tree with Prop: ', nodeObj);
            let childrenNode = [];
            let url = '/identity/dataCenter/tree';
            const selected = this.isEmpty(nodeObj.treeV.getSelected()[0]) ? nodeObj.node: nodeObj.treeV.getSelected()[0];
            const path = selected.path;
            const dataParam = nodeObj.node.data;
            dataParam['is_cached'] = true;

            let param = {
                item_type: 'PROJECT_GROUP',
                item_id:this._.get(nodeObj.node, 'data.id'),
                domain_id: sessionStorage.domainId
            };

            await this.$axios.post(url, param).then((response) => {
                childrenNode = this.getSelectedNodeArr(response.data.items, 'PROJECT');
                nodeObj.treeV.updateNode(path, { data: dataParam });
                if (!this.isEmpty(childrenNode)){
                    childrenNode.forEach(curItem =>{
                        nodeObj.treeV.insert({ node: selected, placement: 'inside' }, curItem);
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
            console.log('Tree Data', this.treeData);
        },
        async createProsProcess(item) {
            const flag = this.selectedData.flag;
            const treeV = this.isEmpty(item.tree) ? this.selectedData.tree : item.tree;
            if (['NG','RNG','SNG'].includes(flag)) {
                this.createDataCenterGroup(item, flag, treeV);
            } else {
                this.createDataCenter(item, flag, treeV);
            }
        },
        async createDataCenterGroup(items, flag, tree) {
            let url = '/identity/dataCenter-group/create';
            let param = this.validateDataCenter();
            if (param){
                param['domain_id'] = sessionStorage.domainId;
                const selected = tree.getSelected()[0];
                if (flag === 'SNG') {
                    param['parent_dataCenter_group_id'] = selected.data.id;
                } else {
                    param['is_root']= true;
                }
                await this.$axios.post(url, param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)){
                        const placement = flag.charAt(0) === 'S' ? 'inside': 'after';
                        const InitializedPG = { id: responseData.dataCenter_group_id, item_type:'PROJECT_GROUP', is_root: responseData.is_root, name: param.name };
                        let newNode = this.getSelectedNode(InitializedPG);

                        if (flag === 'SNG') {
                            this.applyActionOnScreen(items, flag, tree,{ node: newNode, placement: placement });
                        } else {
                            tree.insert({ node: tree.getSelected()[0], placement: placement }, newNode);
                        }
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
        async createDataCenter(items, flag, tree) {
            let url = '/identity/dataCenter/create';
            let param = this.validateDataCenter();
            if (param){
                const selected = tree.getSelected()[0];
                param['domain_id'] = sessionStorage.domainId;
                param['dataCenter_group_id'] = selected.data.id;

                await this.$axios.post(url, param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)){
                        const InitializedPG = { id: responseData.dataCenter_id, item_type:'PROJECT', name: param.name };
                        let newNode = this.getSelectedNode(InitializedPG);
                        this.applyActionOnScreen(items, flag, tree,{ node: newNode, placement: 'inside' });
                    }
                }).catch((error) => {
                    console.error(error);
                });
                this.$refs.IVDC001_EditModal.hideModal();
            }
        },
        async updateDataCenter(items) {
            this.consoleLogEnv('Update DataCenter : ', items);
            const itemType = items.tree.getSelected()[0].data.item_type;
            const selectedId = items.tree.getSelected()[0].data.id;
            const url = itemType === 'PROJECT_GROUP' ? '/identity/dataCenter-group/update': '/identity/dataCenter/update';
            const key = itemType === 'PROJECT_GROUP' ? 'dataCenter_group_id': 'dataCenter_id';
            let param = this.validateDataCenter();
            if (!this.isEmpty(param)){
                param[key] = selectedId;
                await this.$axios.post(url, param).then((response) => {
                    if (response.data[key] === selectedId) {
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
            const itemType = pramTree.tree.getSelected()[0].data.item_type;
            const selectedId = pramTree.tree.getSelected()[0].data.id;
            const url = itemType === 'PROJECT_GROUP' ? '/identity/dataCenter-group/delete': '/identity/dataCenter/delete';
            const key = itemType === 'PROJECT_GROUP' ? 'dataCenter_group_id': 'dataCenter_id';
            let passParam = { domain_id: sessionStorage.domainId };
            passParam[key] = selectedId;

            await this.$axios.post(url, passParam).then((response) => {
                const responseData = response.data;
                console.log(responseData);
                if (this.isEmpty(responseData)){
                    pramTree.tree.remove(pramTree.path);
                    this.$alertify.success('Okay');
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
        async moveDataCenter(items) {
            this.consoleLogEnv('Move Selected Items : ', items);
            const fromItem = items.nodes[0];
            const toItem = items.position.node;
            const url = fromItem.isLeaf ? '/identity/dataCenter/update' : '/identity/dataCenter-group/update';
            let param = {};
            if (fromItem.isLeaf) {
                param['dataCenter_id'] = fromItem.data.id;
                param['dataCenter_group_id'] = toItem.data.id;
            } else {
                param['parent_dataCenter_group_id'] = toItem.data.id;
                param['dataCenter_group_id'] = fromItem.data.id;
                if (items.position.placement !== 'inside' && toItem.data.hasOwnProperty('is_root')){
                    if (toItem.data.is_root) {
                        param['release_parent_dataCenter_group'] = true;
                    }
                }
            }
            await this.$axios.post(url, param).then((response) => {
                const responseData = response.data;
                if (!this.isEmpty(responseData)){
                    console.log('Item successfully moved. ');
                }
            }).catch((error) => {
                console.error(error);
            });
            if (!items.position.node.data.is_cached){
                if (items.isCanceled) {
                    items.position.node.path[items.position.node.path.length-1] = items.position.node.path[items.position.node.path.length-1]-1;
                    items.treeV.select(items.position.node.path, { addToSelection: false });
                }
                items.treeV.updateNode(items.position.node.path, { isExpanded: true });
                this.getNextLayerOnTree({ treeV: items.treeV, node: items.position.node });
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
