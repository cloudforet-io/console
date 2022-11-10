import * as am5 from '@amcharts/amcharts5';

const addAmchartsLicense = (licenses: string[]) => {
    licenses.forEach((license) => {
        am5.addLicense(license);
    });
};

export const initAmcharts5 = (config) => {
    if (config.get('AMCHARTS_LICENSE.ENABLED')) {
        addAmchartsLicense([
            config.get('AMCHARTS_LICENSE.AM5_CHARTS'),
            config.get('AMCHARTS_LICENSE.AM5_MAPS'),
        ]);
    }
};
