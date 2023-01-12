import type { Ref } from 'vue';
import { ref } from 'vue';

import type { InputItem } from '@/inputs/input/type';

interface UseInputDeletionOption {
    selected: Ref<InputItem[]>;
    updateInputValue: (value?: string|number) => void;
    updateSelected: (selected: InputItem[]) => void;
    isInputValueEmpty: Ref<boolean>;
}
export const useInputDeletion = ({
    selected, updateInputValue, updateSelected, isInputValueEmpty,
}: UseInputDeletionOption) => {
    const deleteTarget = ref<InputItem|undefined>(undefined);
    const deleteTargetIdx = ref<number>(-1);
    const deleteSelectedValue = () => {
        const item = selected.value[0];
        if (!item) return;
        updateInputValue(['string', 'number'].includes(typeof item.label) ? item.label as string : item.name);
        updateSelected([]);
    };
    const deleteTargetTag = () => {
        if (!isInputValueEmpty.value) return;
        const lastIdx = selected.value.length - 1;
        if (deleteTargetIdx.value === -1) { // Select the item if there is no selection
            deleteTargetIdx.value = lastIdx;
            deleteTarget.value = selected.value[lastIdx];
            return;
        }

        const targetIdx = deleteTargetIdx.value;
        const targetTag = selected.value[targetIdx];

        if (!targetTag) updateSelected([]);
        deleteTag(targetTag, targetIdx);
    };
    const deleteTag = (tag: InputItem, idx: number) => {
        const _selectedItems: InputItem[] = [...selected.value];
        _selectedItems.splice(idx, 1);
        updateSelected(_selectedItems);
        deleteTargetIdx.value = -1;
        deleteTarget.value = undefined;
    };
    const deleteAll = () => {
        updateSelected([]);
        updateInputValue('');
    };
    return {
        deleteTargetIdx,
        deleteSelectedValue,
        deleteTargetTag,
        deleteTag,
        deleteAll,
    };
};
