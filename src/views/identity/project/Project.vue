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

        <BaseTree ref="IDPJ001_ProjectTree"
                  :tree-prop="treeData"
                  :tree-type="'PROJECT'"
                  :context-init="isInitializing"
                  :con-text-obj="contextProp"
                  @selected="NodeSelected"
                  @edited="editSelected"
                  @delete="deletedSelectedOnTree"
                  @noCacheDrop="moveProject"
                  @toggled="getNextLayerOnTree"
        >
            <template #treeSubPanel>
                <BaseTabNav
                    ref="IDPJ001_TreeSubPanel"
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

import projectSummary from './modules/ProjectSummary.vue';
import projectMember from './modules/ProjectMember.vue';
import projectEditPopupName from '@/views/identity/project/modules/ProjectEditPopupName';
import projectEditPopupTag from '@/views/identity/project/modules/ProjectEditPopupTag';

import BaseTabNav from '@/components/base/tab/BaseTabNav';
import BaseModal from '@/components/base/modal/BaseModal';
import BaseTree from '@/components/base/tree/BaseTree';

const tabs = [
    {
        name: 'summary',
        isSelected: true,
        tabIcon: 'icon-calculator',
        title: 'SUMMARY',
        component: projectSummary,
    },
    {
        name: 'member',
        isSelected: false,
        tabIcon: 'icon-user',
        title: 'MEMBER',
        component: projectMember,
    },
];

const modalTabs = [
    {
        tabIcon: 'icon-calculator',
        title: 'DEFAULT',
        component: projectEditPopupName,
    },
    {
        tabIcon: 'icon-user',
        title: 'TAGS',
        component: projectEditPopupTag,
    },
];

export default {
    name: 'Project',
    components: {
        BaseTabNav,
        BaseTree,
        BaseModal,
    },
    data() {
        return {
            contextProp: {
                /* CPG: Create Project Group
                 * CPR: Create Project
                 * UPG: Update Project Group
                 * UPR: Update Project
                 * RMS: Remove Project Selected
                 */
                Executor: ['CPG', 'CPR', 'UPG', 'UPR', 'RMS'],
                ContextVisible: [false, false, false, false, false],
                icons: ['fal fa-folder-minus', 'fas fa-cube', 'fal fa-pencil', 'fal fa-pencil', 'fal fa-trash'],
                Msg: [['TREE_TYPE.CREATE', 'TREE_TYPE.PROJECT_GROUP'],
                    ['TREE_TYPE.CREATE', 'TREE_TYPE.PROJECT'],
                    ['TREE_TYPE.UPDATE', 'TREE_TYPE.PROJECT_GROUP'],
                    ['TREE_TYPE.UPDATE', 'TREE_TYPE.PROJECT'],
                    ['TREE_TYPE.DELETE', 'TREE_TYPE.PROJECT'],
                ],
            },
            tab: tabs[0].component,
            tabs,
            modalTab: modalTabs[0].component,
            modalTabs,
            selectedData: {}, // Selected Data => Selected node data & flag
            processData: {}, // Process Data => data that has to be taken by action
            createProcess: false,
            updateProcess: false,
            treeData: [],
            projectModalTitle: '',
            modalVisible: false,
            lastEvent: 'Right-Click to open context menus on tree.',
            isInitializing: false,
        };
    },
    created() {
        console.log('This is Test for Dev Server');
        this.listProject();
    },
    methods: {
        NodeSelected(item) {
            this.selectedData = item;
        },
        async listProject() {
            await this.$axios.post('/identity/project/tree', {
                item_type: 'ROOT',
                sort: {
                    key: 'name',
                },
            }).then((response) => {
                const responseData = this.treeDataHandler(response.data, 'PROJECT');
                this.treeData = responseData;
                // Note: Initialize Project trees and then display only a context, This must be included as well.
                if (this.treeData.length === 1 && !this.isEmpty(this._.get(this.treeData[0], 'data.init'))) {
                    this.isInitializing = true;
                }
                console.log(this.treeData);
            }).catch((error) => {
                console.error(error);
            });
        },
        editSelected(item) {
            /** *******************
             Flag:
             CPG: Create Project Group
             CPR: Create Project
             UPG: Update Project Group
             UPR: Update Project
             RMS: Delete Selected
             ********************** */
            this.selectedData = item;
            if (['CPG', 'CPR'].includes(item.flag)) {
                this.updateProcess = !true;
                this.createProcess = true;
                this.projectModalTitle = item.flag === 'CPG' ? this.tr('TREE_TYPE.CREATE', [this.tr('TREE_TYPE.PROJECT_GROUP')]) : this.tr('TREE_TYPE.CREATE', [this.tr('TREE_TYPE.PROJECT')]);
            } else {
                this.createProcess = !true;
                this.updateProcess = true;
                this.projectModalTitle = item.flag === 'UPG' ? this.tr('TREE_TYPE.UPDATE', [this.tr('TREE_TYPE.PROJECT_GROUP')]) : this.tr('TREE_TYPE.UPDATE', [this.tr('TREE_TYPE.PROJECT')]);
            }
            this.$refs.IDPJ001_EditModal.showModal();
        },
        validateProject() {
            let isDefaultValidated = false;
            let isTagValidated = false;
            const params = {};

            const tabChildren = this.$refs.IDPJ001_EditTab.$children;
            const childrenIdx = this.getRightChildrenIndex(tabChildren, ['ProjectEditPopUpName', 'ProjectEditPopUpTag']);

            if (tabChildren[childrenIdx[0]].validateProject()) {
                isDefaultValidated = true;
                params.name = tabChildren[childrenIdx[0]]._data.projectName;
            }

            if (childrenIdx.length > 1) {
                if (tabChildren[childrenIdx[1]].$refs.IDPJ003_ProjectTag.validate()) {
                    params.tags = tabChildren[childrenIdx[1]].$refs.IDPJ003_ProjectTag.tags;
                    isTagValidated = true;
                }
            } else {
                isTagValidated = true;
            }

            if (this.$refs.IDPJ001_EditTab.selectedTab.title == 'DEFAULT') {
                if (isDefaultValidated && !isTagValidated) {
                    this.$refs.IDPJ001_EditTab.selectedTab = this.modalTabs[1];
                }
            } else if (isTagValidated && !isDefaultValidated) {
                this.$refs.IDPJ001_EditTab.selectedTab = this.modalTabs[0];
            }
            return (isTagValidated && isDefaultValidated) ? params : null;
        },
        async getNextLayerOnTree(nodeObj) {
            this.consoleLogEnv('Getting a layer On Tree with Prop: ', nodeObj);
            let childrenNode = [];
            const url = '/identity/project/tree';
            const selected = this.isEmpty(nodeObj.treeV.getSelected()[0]) ? nodeObj.node : nodeObj.treeV.getSelected()[0];
            const { path } = selected;
            const dataParam = nodeObj.node.data;
            dataParam.is_cached = true;

            const param = {
                item_type: 'PROJECT_GROUP',
                item_id: this._.get(nodeObj.node, 'data.id'),
                domain_id: sessionStorage.domainId,
            };

            await this.$axios.post(url, param).then((response) => {
                childrenNode = this.getSelectedNodeArr(response.data.items, 'PROJECT');
                nodeObj.treeV.updateNode(path, { data: dataParam });
                if (!this.isEmpty(childrenNode)) {
                    childrenNode.forEach((curItem) => {
                        nodeObj.treeV.insert({ node: selected, placement: 'inside' }, curItem);
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
            console.log('Tree Data', this.treeData);
        },
        async createProsProcess(item) {
            const { flag } = this.selectedData;
            const treeV = this.isEmpty(item.tree) ? this.selectedData.tree : item.tree;
            if (['CPG'].includes(flag)) {
                this.createProjectGroup(item, flag, treeV);
            } else {
                this.createProject(item, flag, treeV);
            }
        },
        async createProjectGroup(items, flag, tree) {
            const url = '/identity/project-group/create';
            const param = this.validateProject();
            if (param) {
                param.domain_id = sessionStorage.domainId;
                const selected = tree.getSelected()[0];
                const isRootAction = items.hasOwnProperty('root_action') ? items.root_action : false;
                if (isRootAction) {
                    param.is_root = true;
                } else {
                    param.parent_project_group_id = selected.data.id;
                }

                await this.$axios.post(url, param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)) {
                        const placement = isRootAction ? 'after' : 'inside';
                        const InitializedPG = {
                            id: responseData.project_group_id,
                            item_type: 'PROJECT_GROUP',
                            is_root: responseData.is_root,
                            name: param.name,
                        };

                        const newNode = this.getSelectedNode(InitializedPG, 'PROJECT');

                        if (!isRootAction) {
                            this.applyActionOnScreen(items, flag, tree, { node: newNode, placement });
                        } else {
                            tree.insert({ node: tree.getSelected()[0], placement }, newNode);
                        }
                        if (this.isInitializing) {
                            tree.remove([tree.getFirstNode()].map(node => node.path));
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
            const url = '/identity/project/create';
            const param = this.validateProject();
            if (param) {
                const selected = tree.getSelected()[0];
                param.domain_id = sessionStorage.domainId;
                param.project_group_id = selected.data.id;
                await this.$axios.post(url, param).then((response) => {
                    const responseData = !this.isEmpty(response.data) ? response.data : {};
                    if (!this.isEmpty(responseData)) {
                        const InitializedPG = { id: responseData.project_id, item_type: 'PROJECT', name: param.name };
                        const newNode = this.getSelectedNode(InitializedPG, 'PROJECT');
                        this.applyActionOnScreen(items, flag, tree, { node: newNode, placement: 'inside' });
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
            const url = `/identity/${this.replaceAll(itemType, '_', '-').toLowerCase()}/update`;
            const key = `${itemType.toLowerCase()}_id`;
            const param = this.validateProject();
            if (!this.isEmpty(param)) {
                param[key] = selectedId;
                await this.$axios.post(url, param).then((response) => {
                    if (response.data[key] === selectedId) {
                        const treeV = items.tree;
                        const { path } = treeV.getSelected()[0];
                        const updateSummary = this.$refs.IDPJ001_TreeSubPanel.$children;
                        const updateIndex = this.getRightChildrenIndex(updateSummary, 'ProjectSummary');
                        updateSummary[updateIndex].setInitData();
                        treeV.updateNode(path, { title: param.name });
                        this.$refs.IDPJ001_EditModal.hideModal();
                    }
                }).catch((error) => {
                    console.error(error);
                });
            }
        },
        async deletedSelectedOnTree(pramTree) {
            const itemType = pramTree.tree.getSelected()[0].data.item_type;
            const selectedId = pramTree.tree.getSelected()[0].data.id;
            const url = `/identity/${this.replaceAll(itemType, '_', '-').toLowerCase()}/delete`;
            const key = `${itemType.toLowerCase()}_id`;
            const passParam = { domain_id: sessionStorage.domainId };
            passParam[key] = selectedId;
            await this.$axios.post(url, passParam).then((response) => {
                const responseData = response.data;
                if (this.isEmpty(responseData)) {
                    pramTree.tree.remove(pramTree.path);
                    this.$alertify.success('Selected item is successfully deleted.');
                    if (this.treeData.length === 1) {
                        console.log('length1', this.treeData.length);
                        this.isInitializing = true;
                        console.log('length2', this.treeData.length);
                        this.treeData = [{
                            title: '! Please, Right Click me',
                            isLeaf: true,
                            data: {
                                init: true,
                            },
                        }];
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
            const { path } = selected;
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
            const fromItem = items.nodes[0];
            const toItem = items.position.node;
            const url = `/identity/${fromItem.data.item_type.toLowerCase()}/update`;
            const keySrouce = `${fromItem.data.item_type.toLowerCase()}_id`;
            const keyTo = `${toItem.data.item_type.toLowerCase()}_id`;
            param[keySrouce] = fromItem.data.id;
            param[keyTo] = toItem.data.id;

            let param = {};
            if (fromItem.isLeaf) {
                param.project_id = fromItem.data.id;
                param.project_group_id = toItem.data.id;
            } else {
                param.project_group_id = fromItem.data.id;
                param.parent_project_group_id = toItem.data.id;
                if (items.position.placement !== 'inside' && toItem.data.hasOwnProperty('is_root')) {
                    if (toItem.data.is_root) {
                        param.release_parent_project_group = true;
                    }
                }
            }
            await this.$axios.post(url, param).then((response) => {
                const responseData = response.data;
                if (!this.isEmpty(responseData)) {
                    console.log('Item successfully moved. ');
                }
            }).catch((error) => {
                console.error(error);
            });
            if (!items.position.node.data.is_cached) {
                if (items.isCanceled) {
                    items.position.node.path[items.position.node.path.length - 1] = items.position.node.path[items.position.node.path.length - 1] - 1;
                    items.treeV.select(items.position.node.path, { addToSelection: false });
                }
                items.treeV.updateNode(items.position.node.path, { isExpanded: true });
                this.getNextLayerOnTree({ treeV: items.treeV, node: items.position.node });
            }
        },
        async closeSelected() {
            this.$refs.IDPJ001_EditModal.hideModal();
        },
    },
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
