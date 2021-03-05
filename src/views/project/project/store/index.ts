import { ProjectPageState } from '@/views/project/project/store/type';
import { RootTreeNode } from '@spaceone/design-system/dist/src/data-display/tree/type';
import { ProjectItemResp, ProjectTreeItem } from '@/views/project/project/type';
import * as getters from './getters';
import * as actions from './actions';
import * as mutations from './mutations';

const state: ProjectPageState = {
    searchText: undefined,

    rootNode: null as null|RootTreeNode<ProjectItemResp>,
    selectedNode: null as ProjectTreeItem|null,
    treeEditMode: false,

    hasProjectGroup: undefined,
    projectCount: undefined,

    actionTargetNode: null as ProjectTreeItem|null,
    projectGroupFormVisible: false,
    projectGroupFormUpdateMode: false,
    projectGroupDeleteCheckModalVisible: false,
    projectFormVisible: false,
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
