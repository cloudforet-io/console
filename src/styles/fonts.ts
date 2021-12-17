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

const notoSansConfigMap: Record<string, FontConfig> = {
    en: {
        family: 'Noto Sans',
        urlPrefix: 'fonts/noto-sans/en/noto-sans-v12-latin-',
        formats: ['woff2', 'woff'],
    },
    ko: {
        family: 'Noto Sans KR',
        urlPrefix: 'fonts/noto-sans/kr/noto-sans-kr-v13-latin_korean-',
        formats: ['woff2', 'woff'],
    },
    jp: {
        family: 'Noto Sans JP',
        urlPrefix: 'fonts/noto-sans/jp/noto-sans-jp-v28-latin_japanese-',
        formats: ['woff2', 'woff'],
    },
};

const getSources = ({ urlPrefix, formats }, name) => formats.map(format => `url(${urlPrefix}${name}.${format})`).join(', ');

interface FontInfo {
    family: string;
    source: string;
    descriptors: object;
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


export const loadFont = async (fontsInfo: FontInfo[]) => {
    const fonts = fontsInfo.map(({ family, source, descriptors }) => {
        // @ts-ignore
        const font = new FontFace(family, source, descriptors);
        font.display = 'block';
        return font;
    });

    await Promise.all(fonts.map(d => d.load()));

    fonts.forEach((d) => {
        (document as any).fonts.add(d);
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
