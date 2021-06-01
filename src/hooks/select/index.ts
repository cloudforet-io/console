import {
    computed, reactive, SetupContext, UnwrapRef,
} from '@vue/composition-api';
import { pull, remove } from 'lodash';

export interface SelectProps {
    value?: any;
    selected?: any | any[];
    disabled?: boolean;
    predicate?: (value: any, current: any) => boolean;
    multiSelectable?: boolean;
}

type SelectState = UnwrapRef<{
    isSelected: boolean;
}>

const getSelectState = (props: SelectProps) => {
    const state: SelectState = reactive({
        isSelected: computed<boolean>(() => {
            if (Array.isArray(props.selected)) {
                if (props.predicate) {
                    const predicate = props.predicate;
                    return !!props.selected.find(d => predicate(props.value, d));
                }
                return props.selected.includes(props.value);
            }
            if (props.predicate) {
                return props.predicate(props.value, props.selected);
            }
            return props.selected === props.value;
        }),
    });

    return state;
};

export const useMultiSelect = (props: SelectProps, context: SetupContext,
    state: SelectState = getSelectState(props)) => {
    const onClick = () => {
        if (props.disabled) return;

        let newResult: any;
        if (Array.isArray(props.selected)) {
            newResult = [...props.selected];
            if (!state.isSelected) newResult.push(props.value);
            else if (props.predicate) {
                const predicate = props.predicate;
                remove(newResult, d => predicate(props.value, d));
            } else pull(newResult, props.value);
        } else if (typeof props.selected === 'boolean') {
            newResult = !props.selected;
        } else {
            newResult = state.isSelected ? undefined : props.value;
        }

        context.emit('change', newResult, !state.isSelected);
    };

    return {
        state,
        onClick,
    };
};


export const useSingleSelect = (props: SelectProps, context: SetupContext,
    state: SelectState = getSelectState(props)) => {
    const onClick = () => {
        if (props.disabled) return;
        if (state.isSelected) return;

        let newResult: any;
        if (Array.isArray(props.selected)) {
            newResult = [props.value];
        } else if (typeof props.selected === 'boolean') {
            newResult = !props.selected;
        } else {
            newResult = props.value;
        }

        context.emit('change', newResult, true);
    };

    return {
        state,
        onClick,
    };
};


export const useSelect = (props: SelectProps, context: SetupContext) => {
    const state = getSelectState(props);
    const { onClick: onSingleClick } = useSingleSelect(props, context, state);
    const { onClick: onMultiClick } = useMultiSelect(props, context, state);

    const onClick = () => {
        if (props.multiSelectable) onMultiClick();
        else onSingleClick();
    };

    return {
        state,
        onClick,
    };
};
