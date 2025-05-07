import type { Ref } from 'vue';
import { computed } from 'vue';

import type { TreeNodeIcon, TreeNodeRoutePredicate } from '@cloudforet/mirinae/types/data-display/tree/new-tree/type';

import { useProjectGroupReferenceStore } from '@/store/reference/project-group-reference-store';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';

import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { LSBItemProps } from '@/common/modules/navigations/new-lsb/type';

import { indigo } from '@/styles/colors';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

export const useProjectStarredTree = ({ favoriteItems }: { favoriteItems: Ref<FavoriteItem[]>}) => {
    const projectReferenceStore = useProjectReferenceStore();
    const projectGroupReferenceStore = useProjectGroupReferenceStore();
    const projectFavoriteItems = computed(() => favoriteItems.value.filter((favoriteMenu) => {
        if (favoriteMenu.itemType === FAVORITE_TYPE.PROJECT) return true;
        if (favoriteMenu.itemType === FAVORITE_TYPE.PROJECT_GROUP) return true;
        return false;
    }));
    const projectIcon: TreeNodeIcon = 'ic_project-filled';
    const projectGroupIcon: TreeNodeIcon = { iconName: 'ic_folder-filled', iconColor: indigo[500] };
    const predicate: TreeNodeRoutePredicate = () => false;
    const starredItems = computed<LSBItemProps[]>(() => projectFavoriteItems.value.map((item) => ({
        id: item.itemId,
        name: (item.itemType === FAVORITE_TYPE.PROJECT
            ? projectReferenceStore.getters.projectItems[item.itemId]?.name
            : projectGroupReferenceStore.getters.projectGroupItems[item.itemId]?.name
        ) ?? item.label ?? item.name ?? item.itemId,
        icon: item.itemType === FAVORITE_TYPE.PROJECT ? projectIcon : projectGroupIcon,
        link: {
            to: {
                name: PROJECT_ROUTE_V2._NAME,
                params: { projectGroupOrProjectId: item.itemId },
            },
            predicate,
        },
        favoriteOptions: { type: item.itemType, id: item.itemId },
    })));
    return {
        starredItems,
    };
};
