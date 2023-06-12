import { pull, remove } from 'lodash';
import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';


export interface SelectProps {
    value?: any;
    selected?: any | any[];
    disabled?: boolean;
    predicate?: Predicate;
    multiSelectable?: boolean;
}

interface Predicate {
    (value: any, current: any): boolean;
}
interface SelectStateArgs {
    value?: ComputedRef<any> | any;
    selected?: ComputedRef<any | any[]> | any | any[];
    predicate?: ComputedRef<Predicate|undefined> | Predicate;
    disabled?: ComputedRef<boolean|undefined> | boolean;
    multiSelectable?: ComputedRef<boolean|undefined> | boolean;
}

interface SelectState {
    isSelected: boolean;
}

const getSelectState = (state: UnwrapRef<SelectStateArgs>) => reactive({
    isSelected: computed<boolean>(() => {
        if (Array.isArray(state.selected)) {
            if (state.predicate) {
                const predicateFunc = state.predicate;
                return !!state.selected.find((d) => predicateFunc(state.value, d));
            }
            return state.selected.includes(state.value);
        }
        if (state.predicate) return state.predicate(state.value, state.selected);
        return state.selected === state.value;
    }),
});
const getSingleSelected = (state: UnwrapRef<SelectStateArgs>) => {
    if (state.disabled) return undefined;

    let result: any;
    if (Array.isArray(state.selected)) {
        result = [state.value];
    } else {
        result = state.value;
    }

    return result;
};
const getMultiSelected = (state: UnwrapRef<SelectStateArgs>, selectState: SelectState) => {
    if (state.disabled) return undefined;

    let result: any;
    if (Array.isArray(state.selected)) {
        result = [...state.selected];
        if (!selectState.isSelected) {
            result.push(state.value);
        } else if (state.predicate) {
            const predicateFunc = state.predicate;
            remove(result, (d) => predicateFunc(state.value, d));
        } else {
            pull(result, state.value);
        }
    } else if (typeof state.selected === 'boolean') {
        result = !state.selected;
    } else {
        result = selectState.isSelected ? undefined : state.value;
    }
    return result;
};


export const useMultiSelect = ({
    value, selected, predicate, disabled,
}: SelectStateArgs) => {
    const state = reactive({
        value, selected, predicate, disabled,
    });
    const selectState: UnwrapRef<SelectState> = getSelectState(state);
    const getSelected = () => getMultiSelected(state, selectState);

    return {
        ...toRefs(selectState),
        getSelected,
    };
};


export const useSingleSelect = ({
    value, selected, predicate, disabled,
}: SelectStateArgs) => {
    const state = reactive({
        value, selected, predicate, disabled,
    });
    const selectState: UnwrapRef<SelectState> = getSelectState(state);
    const getSelected = () => getSingleSelected(state);

    return {
        ...toRefs(selectState),
        getSelected,
    };
};


export const useSelect = ({
    value, selected, predicate, disabled, multiSelectable,
}: SelectStateArgs) => {
    const state = reactive({
        value, selected, predicate, disabled, multiSelectable,
    });
    const selectedState: UnwrapRef<SelectState> = getSelectState(state);
    const getSelected = () => (state.multiSelectable ? getMultiSelected(state, selectedState) : getSingleSelected(state));

    return {
        ...toRefs(selectedState),
        getSelected,
    };
};
