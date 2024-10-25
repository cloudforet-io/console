import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

interface Predicate<T> {
    (item: T): boolean;
}
export function useListFocus<T>(items: ComputedRef<T[]>, groupId: string, predicate?: Predicate<T>) {
    let focusedItemEl: HTMLElement|null = null;
    const uuid = `${Math.random()}`.slice(2);

    const state = reactive({
        focusableIndices: computed<number[]>(() => {
            if (!predicate) return items.value.map((d, i) => i);
            return items.value.reduce((indices, item, i) => {
                if (predicate(item)) indices.push(i);
                return indices;
            }, [] as number[]);
        }),
    });

    /* functions */
    const getItemId = (idx: number) => `${groupId}-${idx}-${uuid}`;
    const focus = (position?: number): number|undefined => {
        const idx = position === -1 ? state.focusableIndices[state.focusableIndices.length - 1] : state.focusableIndices[position || 0];
        const el = document.getElementById(getItemId(idx));
        if (el) {
            el.focus();
            focusedItemEl = el;
            return idx;
        }
        return undefined;
    };
    const blur = () => {
        if (focusedItemEl) {
            focusedItemEl.blur();
            focusedItemEl = null;
        }
        return undefined;
    };
    const handleMoveUp = (idx: number): number|undefined => {
        const pos = state.focusableIndices.indexOf(idx);
        if (pos !== 0) {
            return focus(pos - 1);
        }
        return blur();
    };
    const handleMoveDown = (idx: number): number|undefined => {
        const pos = state.focusableIndices.indexOf(idx) + 1;

        if (pos !== state.focusableIndices.length) {
            return focus(pos);
        }
        return blur();
    };

    return {
        focus,
        blur,
        handleMoveUp,
        handleMoveDown,
        getItemId,
    };
}
