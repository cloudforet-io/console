import type { Ref } from 'vue';
import { ref, computed } from 'vue';

import { getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { UserReferenceMap } from '@/store/reference/user-reference-store';

interface UserDropdownItem {
    name: string;
    label: string;
    isUserGroup?: boolean;
}
export const useAssigneePoolField = ({
    userReferenceMap,
}: {
    userReferenceMap: Ref<UserReferenceMap>;
}) => {
    const allUserItems = computed<UserDropdownItem[]>(() => Object.values(userReferenceMap.value).map((u) => ({
        name: u.key,
        label: u.label,
        isUserGroup: false, // TODO: Implement isUserGroup
    })));
    const selectedUserItems = ref<SelectDropdownMenuItem[]>([]);
    const assigneePool = computed<string[]>(() => selectedUserItems.value.map((item) => item.name));
    const userMenuItemsHandler: AutocompleteHandler = async (keyword: string, pageStart = 1, pageLimit = 10) => {
        const filteredItems = allUserItems.value.filter((item) => getTextHighlightRegex(keyword).test(item.label));
        const _totalCount = pageStart - 1 + Number(pageLimit);
        const _slicedResults = filteredItems.slice(pageStart - 1, _totalCount);
        return {
            results: _slicedResults,
            more: _totalCount < filteredItems.length,
        };
    };
    const handleUpdateSelectedUserItems = (selectedUsers: SelectDropdownMenuItem[]) => {
        selectedUserItems.value = selectedUsers;
    };
    const prevSelectedUsers = ref<string[]>([]);
    const setInitialUsers = (initialUsers?: string[]) => {
        prevSelectedUsers.value = initialUsers ?? [];
        selectedUserItems.value = allUserItems.value.filter((item) => prevSelectedUsers.value.includes(item.name)).map((item) => ({
            ...item,
            selected: true,
        }));
    };

    return {
        selectedUserItems,
        assigneePool,
        userMenuItemsHandler,
        handleUpdateSelectedUserItems,
        setInitialUsers,
    };
};
