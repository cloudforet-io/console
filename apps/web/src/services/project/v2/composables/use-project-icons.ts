import type { TreeNodeIcon } from '@cloudforet/mirinae/types/data-display/tree/new-tree/type';

import { indigo } from '@/styles/colors';

export const useProjectIcons = () => {
    const projectGroupIcon: TreeNodeIcon = { iconName: 'ic_folder-filled', iconColor: indigo[500] };
    const projectIcon: TreeNodeIcon = 'ic_project-filled';
    return {
        projectGroupIcon,
        projectIcon,
    };
};
