<template>
  <div div class="animated fadeIn">
    <div class="row">
      <div class="col-12">
        <BaseModal ref="IDPJ001_EditModal"
                   :title="projectModalTitle"
                   :centered="true"
                   :hide-footer="true"
        >
          <template #contents>
            <BaseTabNav
              ref="IDPJ001_EditTab"
              :fill="true"
              :nav-tabs="modalTabs"
              :keep-alive="true"
              :is-footer-visible="true"
              :selected-data="selectedData"
              :is-creatable="createProcess"
              :is-updatable="updateProcess"
              @create="createProsProcess"
              @update="updateProject"
              @close="closeSelected"
            />
          </template>
        </BaseModal>
      </div>
    </div>

    <BaseTree ref="projectTree"
              :tree-prop="treeData"
              :context-init="isInitializing"
              @selected="NodeSelected"
              @edited="editSelected"
              @delete="deletedSelectedOnTree"
              @noCacheDrop="moveProject"
              @toggled="getNextLayerOnTree"
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
import projectEditPopupName from '@/views/identity/project/IDPJ_002_ProjectEditPopupName';
import projectEditPopupTag from '@/views/identity/project/IDPJ_003_ProjectEditPopupTag';

import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTree from '@/components/base/tree/BATR_001_BaseTree';

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
    }
];

const modalTabs = [
    {
        tabIcon: 'icon-calculator',
        tabTitle: 'DEFAULT',
        component: projectEditPopupName
    },
    {
        tabIcon: 'icon-user',
        tabTitle: 'TAGS',
        component: projectEditPopupTag
    }
];

export default {
    name: 'Project',
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
            projectModalTitle: 'Edit a Project',
            modalVisible: false,
            lastEvent: 'Right-Click to open context menus on tree.',
            isInitializing: false
        };
    },
    created (){
        this.listProject();
    },
    methods: {
        NodeSelected(item) {

        },
        async listProject() {
            await this.$axios.post('/identity/project/tree', {
                item_id: null,
                item_type: 'ROOT',
                sort: {
                    'key': 'name'
                }
            }).then((response) => {
                const responseData = this.treeDataHandler(response.data, { is_root: true });
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
        editSelected(item) {
                  /*******************************************
                   * TODO :: Please Add More Flags if needed.
                   *  CRT => Create
                   *  UPT => Update
                   *  DEL => Delete
                   ****CRT***********************************
                   *  NG => Node Group
                   *  SNG => Selected Project Group
                   *  SND => Selected Project
                   *  RNG => Root Project Group
                   *  RND => Root Project
                   ****UPT***********************************
                   *  SN => Selected Node Group or Node
                   */
            if (['SN'].includes(item.flag)) {
                this.selectedData = item;
                this.manageTabButton('UPT', true);
                this.selectedData = item;
                this.$refs.IDPJ001_EditModal.showModal();
            } else {
                const title = (item.flag.indexOf('NG') > -1);
                this.selectedData = item;
                this.manageTabButton('CRT', true, title);
                this.$refs.IDPJ001_EditModal.showModal();
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
        validateProject (){
            let isDefaultValidated = false;
            let isTagValidated = false;
            let params = {};
            if (this.$refs.IDPJ001_EditTab.$children[2].validateProject()){
                isDefaultValidated = true;
                params['name'] = this.$refs.IDPJ001_EditTab.$children[2]._data.projectName;
            }
            if (!this.isEmpty(this.$refs.IDPJ001_EditTab.$children[3])){
                if (this.$refs.IDPJ001_EditTab.$children[3].$refs.projectTag.validate()) {
                    params['tags'] = this.$refs.IDPJ001_EditTab.$children[3].$refs.projectTag.tags;
                    isTagValidated = true;
                }
            } else {
                isTagValidated = true;
            }
            if (this.$refs.IDPJ001_EditTab.selectedTab.tabTitle == 'DEFAULT'){
                if (isDefaultValidated && !isTagValidated){
                    this.$refs.IDPJ001_EditTab.selectedTab = this.modalTabs[1];
                }
            } else {
                if (isTagValidated && !isDefaultValidated){
                    this.$refs.IDPJ001_EditTab.selectedTab = this.modalTabs[0];
                }
            }
            return (isTagValidated && isDefaultValidated) ? params : null;
        },
        async getNextLayerOnTree (nodeObj){
            this.consoleLogEnv('Getting a layer On Tree with Prop: ', nodeObj);
            let childrenNode = [];
            let url = '/identity/project/tree';
            const selected = this.isEmpty(nodeObj.treeV.getSelected()[0]) ? nodeObj.node: nodeObj.treeV.getSelected()[0];
            const path = selected.path;
            console.log('###############', path);
            const dataParam = nodeObj.node.data;
            dataParam['is_cached'] = true;

            let param = {
                item_type: 'PROJECT_GROUP',
                item_id:this._.get(nodeObj.node, 'data.id'),
                domain_id: sessionStorage.domainId
            };

            await this.$axios.post(url, param).then((response) => {
                childrenNode = this.getSelectedNodeArr(response.data.items);
                nodeObj.treeV.updateNode(path, { data: dataParam });
                if (!this.isEmpty(childrenNode)){
                    childrenNode.forEach(curItem =>{
                        nodeObj.treeV.insert({ node: selected, placement: 'inside' }, curItem);
                        //nodeObj.treeV.insert({ node: nodeObj.node, placement: 'inside' }, curItem);
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
            console.log('Tree Data', this.treeData);
        },
        async createProsProcess(items) {
            const flag = this.selectedData.flag;
            const treeV = this.isEmpty(items.tree) ? this.selectedData.tree : items.tree;
            if (['NG','RNG','SNG'].includes(flag)) {
                this.createProjectGroup(items, flag, treeV);
            } else {
                this.createProject(items, flag, treeV);
            }
        },
        async createProjectGroup(items, flag, tree) {
            let url = '/identity/project-group/create';
            let param = this.validateProject();
            if (param){
                param['domain_id'] = sessionStorage.domainId;
                const selected = tree.getSelected()[0];
                if (flag === 'SNG') {
                    param['parent_project_group_id'] = selected.data.id;
                } else {
                    param['is_root']= true;
                }
                await this.$axios.post(url, param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)){
                        const placement = flag.charAt(0) === 'S' ? 'inside': 'after';
                        const InitializedPG = { id: responseData.project_group_id, item_type:'PROJECT_GROUP', is_root: responseData.is_root, name: param.name };
                        let newNode = this.getSelectedNode(InitializedPG);

                        if (flag === 'SNG') {
                            this.applyActionOnScreen(items, flag, tree,{ node: newNode, placement: placement });
                        } else {
                            tree.insert({ node: tree.getSelected()[0], placement: placement }, newNode);
                        }
                        if (this.isInitializing){
                            tree.remove([tree.getLastNode()].map(node => node.path));
                            this.isInitializing = false;
                        }
                    }
                }).catch((error) => {
                    console.error(error);
                });
                this.$refs.IDPJ001_EditModal.hideModal();
            }
        },
        async createProject(items, flag, tree) {
            let url = '/identity/project/create';
            let param = this.validateProject();
            if (param){
                const selected = tree.getSelected()[0];
                param['domain_id'] = sessionStorage.domainId;
                param['project_group_id'] = selected.data.id;

                await this.$axios.post(url, param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)){
                        const InitializedPG = { id: responseData.project_id, item_type:'PROJECT', name: param.name };
                        let newNode = this.getSelectedNode(InitializedPG);
                        this.applyActionOnScreen(items, flag, tree,{ node: newNode, placement: 'inside' });
                    }
                }).catch((error) => {
                    console.error(error);
                });
                this.$refs.IDPJ001_EditModal.hideModal();
            }
        },
        async updateProject(items) {
            this.consoleLogEnv('Update Project : ', items);
            const itemType = items.tree.getSelected()[0].data.item_type;
            const selectedId = items.tree.getSelected()[0].data.id;
            const url = itemType === 'PROJECT_GROUP' ? '/identity/project-group/update': '/identity/project/update';
            const key = itemType === 'PROJECT_GROUP' ? 'project_group_id': 'project_id';
            let param = this.validateProject();

            if (!this.isEmpty(param)){
                param[key] = selectedId;
                await this.$axios.post(url, param).then((response) => {
                    if (response.data.project_group_id === selectedId) {
                        const treeV = items.tree;
                        const path = treeV.getSelected()[0].path;
                        treeV.updateNode(path, { title: this.$refs.IDPJ001_EditTab.$children[2]._data.projectName });
                        this.$refs.IDPJ001_EditModal.hideModal();
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        },
        async deletedSelectedOnTree (pramTree){
            const itemType = pramTree.tree.getSelected()[0].data.item_type;
            const selectedId = pramTree.tree.getSelected()[0].data.id;
            const url = itemType === 'PROJECT_GROUP' ? '/identity/project-group/delete': '/identity/project/delete';
            const key = itemType === 'PROJECT_GROUP' ? 'project_group_id': 'project_id';
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
        async moveProject(items) {

            this.consoleLogEnv('Move Selected Items : ', items);

            const fromItem = items.nodes[0];
            const toItem = items.position.node;
            const url = fromItem.isLeaf ? '/identity/project/update' : '/identity/project-group/update';
            let param = {};

            if (fromItem.isLeaf) {
                param['project_id'] = fromItem.data.id;
                param['project_group_id'] = toItem.data.id;
            } else {
                param['parent_project_group_id'] = toItem.data.id;
                param['project_group_id'] = fromItem.data.id;
                if (items.position.placement !== 'inside' && toItem.data.hasOwnProperty('is_root')){
                    if (toItem.data.is_root) {
                        param['is_root'] = true;
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
            this.$refs.IDPJ001_EditModal.hideModal();
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
