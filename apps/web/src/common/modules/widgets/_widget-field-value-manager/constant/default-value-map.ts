import type { WidgetFieldTypeMap } from '@/common/modules/widgets/_widget-field-value-manager/type';

import { gray } from '@/styles/colors';

type DefaultValueMap = Record<keyof WidgetFieldTypeMap, any>;

export const defaultValueMap: DefaultValueMap = {
    formatRules: {
        baseColor: gray[200],
        rules: [],
    },
};
