import type { Ref, UnwrapRef } from 'vue';
import { ref } from 'vue';

import type { InputItem } from '@/inputs/input/text-input/type';

interface UseInputDeletionOption<Item = InputItem> {
    selected: Ref<Item[]>;
    updateValueAfterDeletion?: (item?: Item) => void;
    updateSelected: (selected: Item[]) => void;
    isInputValueEmpty: Ref<boolean>;
}
export function useInputDeletion<Item extends object = InputItem>({
    selected, updateValueAfterDeletion, updateSelected, isInputValueEmpty,
}: UseInputDeletionOption<Item>) {
    const deleteTarget = ref<Item|undefined>(undefined);
    const deleteTargetIdx = ref<number>(-1);
    const deleteSingleSelectedValue = () => {
        const item = selected.value[0];
        if (!item) return;
        updateSelected([]);
        if (updateValueAfterDeletion) updateValueAfterDeletion(item);
    };
    const deleteTargetTag = () => {
        if (!isInputValueEmpty.value) return;
        const lastIdx = selected.value.length - 1;
        if (deleteTargetIdx.value === -1) { // Select the item if there is no selection
            deleteTargetIdx.value = lastIdx;
            deleteTarget.value = selected.value[lastIdx] as UnwrapRef<Item>;
            return;
        }

        const targetIdx = deleteTargetIdx.value;
        const targetTag = selected.value[targetIdx];

        if (!targetTag) updateSelected([]);
        deleteTag(targetTag, targetIdx);
    };
    const deleteTag = (tag: Item, idx: number) => {
        const _selectedItems: Item[] = [...selected.value];
        _selectedItems.splice(idx, 1);
        updateSelected(_selectedItems);
        deleteTargetIdx.value = -1;
        deleteTarget.value = undefined;
    };
    const deleteAll = () => {
        updateSelected([]);
        if (updateValueAfterDeletion) updateValueAfterDeletion();
    };
    return {
        deleteTargetIdx,
        deleteSingleSelectedValue,
        deleteTargetTag,
        deleteTag,
        deleteAll,
    };
}
