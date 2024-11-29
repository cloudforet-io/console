<script setup lang="ts">
import type { Ref } from 'vue';
import {
    ref, computed, toRef, watch,
} from 'vue';

import { PSelectDropdown, getTextHighlightRegex } from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';

interface UserDropdownItem extends SelectDropdownMenuItem {
    name: string;
    label: string;
}

const props = defineProps<{
    userIds?: string[];
    useFixedMenuStyle?: boolean;
}>();

const emit = defineEmits<{(event: 'update:user-ids', value: string[]): void}>();


const userReferenceStore = useUserReferenceStore();
const userReferenceMap: Ref<UserReferenceMap> = toRef(userReferenceStore.getters, 'userItems');
const allUserItems = computed<UserDropdownItem[]>(() => Object.values(userReferenceMap.value).map((u) => ({
    name: u.key,
    label: u.label,
})));
const selectedUserItems = ref<SelectDropdownMenuItem[]>([]);
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

const userIds = computed<string[]>(() => selectedUserItems.value.map((item) => item.name));
const setInitialUsers = (initialUserIds?: string[]) => {
    if (!initialUserIds) {
        selectedUserItems.value = [];
        return;
    }
    selectedUserItems.value = initialUserIds.map((userId) => ({
        name: userId,
        label: userReferenceMap.value[userId].label ?? userId,
        selected: true,
    }));
};

watch(userIds, (newUserIds) => {
    if (newUserIds !== props.userIds) {
        setInitialUsers(newUserIds);
        emit('update:user-ids', newUserIds);
    }
});
</script>

<template>
    <p-select-dropdown show-select-marker
                       :selected="selectedUserItems"
                       :handler="userMenuItemsHandler"
                       is-filterable
                       :use-fixed-menu-style="useFixedMenuStyle"
                       show-delete-all-button
                       @update:selected="handleUpdateSelectedUserItems"
    />
</template>
