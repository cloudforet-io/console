/*
https://google-webfonts-helper.herokuapp.com/fonts
 */

interface FontConfig {
    family: string;
    urlPrefix: string;
    formats: string[];
}
const robotoConfig: FontConfig = {
    family: 'Roboto',
    urlPrefix: 'fonts/roboto/roboto-v27-latin-',
    formats: ['woff2', 'woff'],
};
const inconsolataConfig: FontConfig = {
    family: 'Inconsolata',
    urlPrefix: 'fonts/inconsolata/Inconsolata-VariableFont_wdth,wght',
    formats: ['ttf'],
};

export const notoSansConfigMap: Record<'en'|'ko'|'ja', FontConfig> = {
    en: {
        family: 'Noto Sans',
        urlPrefix: 'fonts/noto-sans/en/noto-sans-v27-latin-',
        formats: ['woff2', 'woff'],
    },
    ko: {
        family: 'Noto Sans KR',
        urlPrefix: 'fonts/noto-sans/kr/noto-sans-kr-v13-latin_korean-',
        formats: ['woff2', 'woff'],
    },
    ja: {
        family: 'Noto Sans JP',
        urlPrefix: 'fonts/noto-sans/jp/noto-sans-jp-v28-latin_japanese-',
        formats: ['woff2', 'woff'],
    },
};

const getSources = ({ urlPrefix, formats }: FontConfig, name = '') => formats.map((format) => `url(${urlPrefix}${name}.${format})`).join(', ');

interface FontInfo {
    family: string;
    source: string;
    descriptors?: object;
}

export const fontInfoMap: Record<string, FontInfo[]> = {
    default: [
        {
            family: notoSansConfigMap.en.family,
            source: getSources(notoSansConfigMap.en, 'regular'),
            descriptors: {
                weight: 400,
            },
        },
        {
            family: notoSansConfigMap.en.family,
            source: getSources(notoSansConfigMap.en, '500'),
            descriptors: {
                weight: 500,
            },
        },
        {
            family: notoSansConfigMap.en.family,
            source: getSources(notoSansConfigMap.en, '700'),
            descriptors: {
                weight: 700,
            },
        },
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
            source: getSources(robotoConfig, '500'),
            descriptors: {
                weight: 500,
            },
        },
        {
            family: robotoConfig.family,
            source: getSources(robotoConfig, '500italic'),
            descriptors: {
                style: 'italic',
                weight: 500,
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
    ],
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
            source: getSources(notoSansConfigMap.en, '500'),
            descriptors: {
                weight: 500,
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
            source: getSources(notoSansConfigMap.ko, '500'),
            descriptors: {
                weight: 500,
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
    ja: [
        {
            family: notoSansConfigMap.ja.family,
            source: getSources(notoSansConfigMap.ja, 'regular'),
            descriptors: {
                weight: 400,
            },
        },
        {
            family: notoSansConfigMap.ja.family,
            source: getSources(notoSansConfigMap.ja, '500'),
            descriptors: {
                weight: 500,
            },
        },
        {
            family: notoSansConfigMap.ja.family,
            source: getSources(notoSansConfigMap.ja, '700'),
            descriptors: {
                weight: 700,
            },
        },
    ],
    monospace: [
        {
            family: inconsolataConfig.family,
            source: getSources(inconsolataConfig),
            descriptors: {
                weight: 400,
                variationSettings: ' \'wght\' 400, \'wdth\' 100',
            },
        },
        {
            family: inconsolataConfig.family,
            source: getSources(inconsolataConfig),
            descriptors: {
                weight: 600,
                variationSettings: ' \'wght\' 600, \'wdth\' 100',
            },
        },
    ],
};

export const loadFont = async (fontsInfo: FontInfo[]) => {
    const fonts = fontsInfo.map(({ family, source, descriptors }) => {
        const font = new FontFace(family, source, descriptors);
        font.display = 'block';
        return font;
    });

    const results = await Promise.allSettled(fonts.map((d) => d.load()));
    results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            (document as any).fonts.add(result.value);
        } else {
            console.error(`Failed to load fonts. 
            family: ${fontsInfo[idx].family}
            source: ${fontsInfo[idx].source}
            descriptors: ${JSON.stringify(fontsInfo[idx].descriptors)}
            Error: `, result.reason);
        }
    });
};

const loaded: Record<string, boolean> = {};
export const loadFonts = async (lang) => {
    try {
        let fontsInfo: FontInfo[] = [];

        if (!loaded.default) {
            fontsInfo = fontsInfo.concat(fontInfoMap.default);
        }

        if (!loaded[lang] && fontInfoMap[lang]) {
            fontsInfo = fontsInfo.concat(fontInfoMap[lang]);
        }

        await loadFont(fontsInfo);

        if (!loaded.default) loaded.default = true;
        if (!loaded[lang] && fontInfoMap[lang]) loaded[lang] = true;
    } catch (e) {
        console.error(`Failed to load fonts for ${lang}.`, e);
    } finally {
        document.body.lang = lang;
    }
};

export const loadMonospaceFonts = async () => {
    try {
        let fontsInfo: FontInfo[] = [];

        if (!loaded.monospace) {
            fontsInfo = fontsInfo.concat(fontInfoMap.monospace);
        }

        await loadFont(fontsInfo);

        if (!loaded.monospace) loaded.monospace = true;
    } catch (e) {
        console.error('Failed to load monospace fonts.', e);
    }
};
