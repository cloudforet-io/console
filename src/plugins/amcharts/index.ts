import { color } from '@amcharts/amcharts4/.internal/core/utils/Color';
import { ColorSet } from '@amcharts/amcharts4/.internal/core/utils/ColorSet';
import { options } from '@amcharts/amcharts4/.internal/core/Options';
import { useTheme, addLicense } from '@amcharts/amcharts4/.internal/core/utils/Instance';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';
import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';


export const addAmchartsLicense = (licenses?: string[]) => {
    if (Array.isArray(licenses)) {
        licenses.forEach((license) => {
            addLicense(license);
        });
    }
};

const customColorTheme = (target) => {
    if (target instanceof ColorSet) {
        target.list = Array(5).fill(DEFAULT_CHART_COLORS.map(d => color(d))).flat();
    }
};

export const applyAmchartsGlobalSettings = (licenses?: string[]) => {
    addAmchartsLicense(licenses);
    useTheme(customColorTheme);
    useTheme(am4themesAnimated);
    options.autoSetClassName = true;
};
