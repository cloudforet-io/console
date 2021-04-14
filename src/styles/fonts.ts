/*
https://google-webfonts-helper.herokuapp.com/fonts
 */

const robotoConfig = {
    family: 'Roboto',
    urlPrefix: 'fonts/roboto/roboto-v27-latin-',
    formats: ['woff', 'woff2'],
};

const notoSansConfigMap = {
    en: {
        family: 'Noto Sans',
        urlPrefix: 'fonts/noto-sans/en/noto-sans-v12-latin-',
        formats: ['woff', 'woff2'],
    },
    ko: {
        family: 'Noto Sans KR',
        urlPrefix: 'fonts/noto-sans/kr/noto-sans-kr-v13-latin_korean-',
        formats: ['woff', 'woff2'],
    },
    jp: {
        family: 'Noto Sans JP',
        urlPrefix: 'fonts/noto-sans/jp/noto-sans-jp-v28-latin_japanese-',
        formats: ['woff', 'woff2'],
    },
};

const getSources = ({ urlPrefix, formats }, name) => formats.map(format => `url(${urlPrefix}${name}.${format})`).join(', ');

export const defaultFonts = [
    {
        family: robotoConfig.family,
        source: getSources(robotoConfig, 'regular'),
        descriptors: {
            weight: 400,
        },
    },
    {
        family: robotoConfig.family,
        source: getSources(robotoConfig, 'italic'),
        descriptors: {
            style: 'italic',
            weight: 400,
        },
    },
    {
        family: robotoConfig.family,
        source: getSources(robotoConfig, '700'),
        descriptors: {
            weight: 700,
        },
    },
    {
        family: robotoConfig.family,
        source: getSources(robotoConfig, '700italic'),
        descriptors: {
            style: 'italic',
            weight: 700,
        },
    },
];


export const langFontsMap = {
    en: [
        {
            family: notoSansConfigMap.en.family,
            source: getSources(notoSansConfigMap.en, 'regular'),
            descriptors: {
                weight: 400,
            },
        },
        {
            family: notoSansConfigMap.en.family,
            source: getSources(notoSansConfigMap.en, '700'),
            descriptors: {
                weight: 700,
            },
        },
    ],
    ko: [
        {
            family: notoSansConfigMap.ko.family,
            source: getSources(notoSansConfigMap.ko, 'regular'),
            descriptors: {
                weight: 400,
            },
        },
        {
            family: notoSansConfigMap.ko.family,
            source: getSources(notoSansConfigMap.ko, '700'),
            descriptors: {
                weight: 700,
            },
        },
    ],
    jp: [
        {
            family: notoSansConfigMap.jp.family,
            source: getSources(notoSansConfigMap.jp, 'regular'),
            descriptors: {
                weight: 400,
            },
        },
        {
            family: notoSansConfigMap.jp.family,
            source: getSources(notoSansConfigMap.jp, '700'),
            descriptors: {
                weight: 700,
            },
        },
    ],
};
