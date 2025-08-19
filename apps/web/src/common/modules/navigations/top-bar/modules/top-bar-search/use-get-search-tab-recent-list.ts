import type { SearchTab } from '@/common/modules/navigations/top-bar/modules/top-bar-search/type';
import { useRecentList } from '@/common/modules/recents/use-recent-list';

export const useGetSearchTabRecentList = () => {
    const recentData = useRecentList();

    const getRecentListBySearchTab = (activeTab: SearchTab) => {
        if (activeTab === 'project') {
            return recentData.projectRecentList.value ?? [];
        } if (activeTab === 'service') {
            return recentData.serviceRecentList.value ?? [];
        } if (activeTab === 'serviceAccount') {
            return recentData.serviceAccountRecentList.value ?? [];
        } if (activeTab === 'dashboard') {
            return recentData.dashboardRecentList.value ?? [];
        } if (activeTab === 'cloudService') {
            return recentData.cloudServiceRecentList.value ?? [];
        }
        return [];
    };

    return {
        getRecentListBySearchTab,
    };
};
