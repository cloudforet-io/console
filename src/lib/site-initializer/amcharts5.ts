import * as am5 from '@amcharts/amcharts5';

import { DEFAULT_CHART_COLORS } from '@/styles/colorsets';

const addAmchartsLicense = (licenses: string[]) => {
    licenses.forEach((license) => {
        am5.addLicense(license);
    });
};

export class Amcharts5GlobalTheme extends am5.Theme {
    setupDefaultRules() {
        this.rule('ColorSet').setAll({
            colors: Array(5).fill(DEFAULT_CHART_COLORS.map((d) => am5.color(d))).flat(),
        });
    }
}

export const initAmcharts5 = (config) => {
    if (config.get('AMCHARTS_LICENSE.ENABLED')) {
        addAmchartsLicense([
            config.get('AMCHARTS_LICENSE.AM5_CHARTS'),
            config.get('AMCHARTS_LICENSE.AM5_MAPS'),
        ]);
    }
};
