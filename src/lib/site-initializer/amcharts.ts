import config from '@/lib/config';
import * as am4core from '@amcharts/amcharts4/core';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';

import {
    blue, coral, green, indigo, peacock, red, violet, yellow,
} from '@/styles/colors';

const CUSTOM_COLORS = [
    violet[400], violet[500], blue[400], blue[600], coral[400], coral[600],
    yellow[400], yellow[600], green[400], green[600], peacock[400], peacock[600],
    red[400], red[600], indigo[400], indigo[600], violet[600], violet[800],
    blue[500], blue[700], coral[500], coral[700], yellow[500], yellow[700],
    green[500], green[700], peacock[500], peacock[700], red[500], red[700],
];

const initAmchartsLicense = () => {
    if (config.get('AMCHARTS_LICENSE.ENABLED')) {
        am4core.addLicense(config.get('AMCHARTS_LICENSE.CHARTS'));
        am4core.addLicense(config.get('AMCHARTS_LICENSE.MAPS'));
        am4core.addLicense(config.get('AMCHARTS_LICENSE.TIMELINE'));
    }
};

const customColorTheme = (target) => {
    if (target instanceof am4core.ColorSet) {
        target.list = Array(5).fill(CUSTOM_COLORS.map(d => am4core.color(d))).flat();
    }
};

const applyCustomStyleToAmcharts = () => {
    am4core.useTheme(customColorTheme);
    am4core.useTheme(am4themesAnimated);
    am4core.options.autoSetClassName = true;
};

export const initAmcharts = () => {
    initAmchartsLicense();
    applyCustomStyleToAmcharts();
};
