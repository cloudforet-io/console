import type { Ref } from 'vue';
import { computed } from 'vue';

import type { InputItem } from '@/inputs/input/text-input/type';

interface UseSelectedValidationOptions {
    selected: Ref<InputItem[]>
}
export const useSelectedValidation = ({
    selected,
}: UseSelectedValidationOptions) => {
    const isSelectedInvalid = computed(() => Object.values<number[]>(selectedIndicesMap.value).some((indices) => indices.length > 1));
    const selectedIndicesMap = computed<Record<string, number[]>>(() => {
        const result = {};
        selected.value.forEach((item, idx) => {
            if (result[item.name]) {
                result[item.name].push(idx);
            } else {
                result[item.name] = [idx];
            }
        });
        return result;
    });
    const isSelectedItemInvalid = (tag: InputItem, index: number) => {
        if (tag.error) return true;
        return selectedIndicesMap.value[tag.name].length > 0 && selectedIndicesMap.value[tag.name][0] !== index;
    };
    return {
        isSelectedInvalid,
        isSelectedItemInvalid,
    };
};
