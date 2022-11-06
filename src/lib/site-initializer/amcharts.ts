import * as am4core from '@amcharts/amcharts4/core';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';

import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';

const addAmchartsLicense = (licenses?: any[]) => {
    if (Array.isArray(licenses)) {
        licenses.forEach((license) => {
            am4core.addLicense(license);
        });
    }
};

const customColorTheme = (target) => {
    if (target instanceof am4core.ColorSet) {
        target.list = Array(5).fill(DEFAULT_CHART_COLORS.map((d) => am4core.color(d))).flat();
    }
};

const applyAmchartsGlobalSettings = () => {
    am4core.useTheme(customColorTheme);
    am4core.useTheme(am4themesAnimated);
    am4core.options.autoSetClassName = true;
};

export const initAmcharts = (config) => {
    if (config.get('AMCHARTS_LICENSE.ENABLED')) {
        addAmchartsLicense([
            config.get('AMCHARTS_LICENSE.CHARTS'),
            config.get('AMCHARTS_LICENSE.MAPS'),
            config.get('AMCHARTS_LICENSE.TIMELINE'),
        ]);
    }
    applyAmchartsGlobalSettings();
};
