import { ReferenceState } from '@/store/modules/reference/type';
import { forEach } from 'lodash';
import { DynamicFieldProps } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type';
import { EnumOptions } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import { Getter } from 'vuex';

export const fieldItems: Getter<ReferenceState, {}> = (state: ReferenceState): Partial<DynamicFieldProps> => {
    const options: EnumOptions = {};
    forEach(state.items, (d, k) => {
        options[k] = {
            name: d.label,
            type: 'badge',
            options: {
                background_color: d.color,
            },
        };
    });
    return { type: 'enum', options };
};
