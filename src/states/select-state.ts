import { computed, reactive, SetupContext } from '@vue/composition-api';
import { pull, remove } from 'lodash';

export interface SelectProps {
    value?: any;
    selected?: any | any[];
    disabled?: boolean;
    predicate?: (value: any, current: any) => boolean;
}


export const multiSelectState = (props: SelectProps, context: SetupContext) => {
    const state = reactive({
        isSelected: computed(() => {
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
