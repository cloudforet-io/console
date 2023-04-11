import type { Ref } from 'vue';
import { computed } from 'vue';

import type { InputItem } from '@/inputs/input/text-input/type';

type ItemKey<Item> = string | { (item: Item): string };
interface UseSelectedValidationOptions<Item> {
    selected: Ref<Item[]>;
    itemKey?: ItemKey<Item>;
}

function getSelectedIndicesMap<Item extends object>(selected: Item[], itemKey: ItemKey<Item>) {
    const result = {};
    selected.forEach((item, idx) => {
        const key = typeof itemKey === 'function' ? itemKey(item) : item[itemKey];
        if (result[key]) {
            result[key].push(idx);
        } else {
            result[key] = [idx];
        }
    });
    return result;
}
export function useSelectedValidation<Item extends object = InputItem>({
    selected, itemKey = 'name',
}: UseSelectedValidationOptions<Item>) {
    const isSelectedInvalid = computed(() => Object.values<number[]>(selectedIndicesMap.value).some((indices) => indices.length > 1));
    const selectedIndicesMap = computed<Record<string, number[]>>(() => getSelectedIndicesMap<Item>(selected.value, itemKey));
    const isSelectedItemInvalid = (tag: Item, index: number) => {
        if ((tag as InputItem).error) return true;
        const key = typeof itemKey === 'function' ? itemKey(tag) : tag[itemKey];
        return selectedIndicesMap.value[key].length > 0 && selectedIndicesMap.value[key][0] !== index;
    };
    return {
        isSelectedInvalid,
        isSelectedItemInvalid,
    };
}
