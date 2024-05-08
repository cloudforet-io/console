import type { Ref } from 'vue';
import { computed, reactive } from 'vue';


import type { WidgetColorSetType, WidgetTheme } from '@/common/modules/widgets/_types/widget-type';
import { WIDGET_THEMES } from '@/common/modules/widgets/_types/widget-type';

import { palette } from '@/styles/colors';


const getColorSet = (theme: WidgetTheme, colorSetType: WidgetColorSetType = 'basic'): string[] => {
    let colorSet = WIDGET_THEMES.map((d) => palette[d][400]);
    if (colorSetType === 'massive') {
        const colors1 = WIDGET_THEMES.map((d) => [palette[d][400], palette[d][600]]).flat();
        const colors2 = WIDGET_THEMES.map((d) => [palette[d][500], palette[d][700]]).flat();
        colorSet = colors1.concat(colors2);
    }
    const themeIndex = WIDGET_THEMES.findIndex((d) => d === theme);
    if (themeIndex > -1) {
        const arr1 = colorSet.slice(themeIndex, colorSet.length);
        const arr2 = colorSet.slice(0, themeIndex);
        return arr1.concat(arr2);
    }
    return colorSet;
};

interface UseWidgetColorSetOptions {
    theme: Ref<WidgetTheme | undefined>;
    dataSize: Ref<number> | number;
}
export const useWidgetColorSet = ({
    theme, dataSize,
}: UseWidgetColorSetOptions) => {
    const state = reactive({
        dataSize,
    });
    return {
        colorSet: computed<string[]>(() => {
            if (!theme?.value) return [];
            if (!state.dataSize) return [];
            const colorSetType: WidgetColorSetType = state.dataSize > 9 ? 'massive' : 'basic';
            return getColorSet(theme.value, colorSetType);
        }),
    };
};
