import { DynamicFieldProps } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type';
import { EnumOptions } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-field/type/field-schema';
import { forEach } from 'lodash';
import { Getter } from 'vuex';

import { ProviderReferenceState } from '@/store/modules/reference/provider/type';

export const fieldItems: Getter<ProviderReferenceState, any> = (state): Partial<DynamicFieldProps> => {
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
