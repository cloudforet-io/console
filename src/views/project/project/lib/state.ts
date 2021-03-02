import { reactive, computed } from '@vue/composition-api';
import { ProjectItemResp, ProjectTreeItem } from '@/views/project/project/type';
import { RootTreeNode } from '@spaceone/design-system/dist/src/data-display/tree/type';

let projectState;

export const getProjectState = () => {
    if (!projectState) {
        projectState = reactive({
            groupId: undefined,
            groupName: undefined,
            searchText: undefined,
            isPermissionDenied: false,
            rootNode: null as null|RootTreeNode<ProjectItemResp>,
            selectedNode: null as ProjectTreeItem|null,
            actionTargetNode: null as ProjectTreeItem|null,
            hasProjectGroup: computed(() => {
                if (Array.isArray(projectState.rootNode?.children)) {
                    return !!projectState.rootNode.children.length;
                } return projectState.rootNode?.children;
            }),
        });
    }

    return projectState;
};
