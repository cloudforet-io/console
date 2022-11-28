import * as am4core from '@amcharts/amcharts4/core';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';

import { BASIC_CHART_COLORS } from '@/styles/colorsets';


export const addAmchartsLicense = (licenses?: string[]) => {
    if (Array.isArray(licenses)) {
        licenses.forEach((license) => {
            am4core.addLicense(license);
        });
    }
};

const customColorTheme = (target) => {
    if (target instanceof am4core.ColorSet) {
        target.list = Array(5).fill(BASIC_CHART_COLORS.map((d) => am4core.color(d))).flat();
    }
};

export const applyAmchartsGlobalSettings = (licenses?: string[]) => {
    addAmchartsLicense(licenses);
    am4core.useTheme(customColorTheme);
    am4core.useTheme(am4themesAnimated);
    am4core.options.autoSetClassName = true;
};
