<script lang="ts" setup>

import { PButton, PSpinner } from '@spaceone/design-system';
import { toPng } from 'html-to-image';
import * as pdfMake from 'pdfmake/build/pdfmake';
import type { TCreatedPdf } from 'pdfmake/build/pdfmake';
// eslint-disable-next-line import/extensions,import/no-unresolved
import type { Content, TableCell } from 'pdfmake/interfaces';
import {
    computed,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import {
    pdfFontInfoMap, fontLanguages, pdfFontFamily,
} from '@/common/components/layouts/PdfDownloadOverlay/fonts';
import type { PdfFontFamily, Language } from '@/common/components/layouts/PdfDownloadOverlay/fonts';
import type { Item } from '@/common/components/layouts/PdfDownloadOverlay/type';

import { gray, black, white } from '@/styles/colors';

const paperSizes = ['A4'] as const;
const modes = ['ELEMENT_EMBED', 'PDF_EMBED', 'PDF_NEW_TAB'] as const;
const PAGE_PADDING = 12;
const IMAGE_ROW_MARGIN_Y = 4;
const orientations = ['portrait', 'landscape'] as const;
const EMPTY_ROW_COUNT = 5;

type PaperSize = typeof paperSizes[number];
type Mode = typeof modes[number];
type Orientation = typeof orientations[number];
type PaperSizeInfo = {width: number; height: number};

const paperSizeInfoMap: Record<PaperSize, PaperSizeInfo> = Object.freeze({
    A4: { width: 595.28, height: 841.89 },
});

interface Props {
    visible: boolean;
    mode: Mode;
    items: Array<Item>;
    paperSize: PaperSize;
    orientation: Orientation;
    fileName: string;
    fontLanguage?: Language;
}

const COMPLETED_ELEMENT_RATE = 70;
const COMPLETED_IMAGE_RATE = 90;
const COMPLETED_PDF_RATE = 100;

const props = withDefaults(defineProps<Props>(), {
    mode: 'PDF_EMBED',
    items: () => [],
    paperSize: 'A4',
    orientation: 'portrait',
    fileName: 'report',
    fontLanguage: fontLanguages.en,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const { t } = useI18n();

const state = reactive({
    proxyVisible: props.visible,
    loading: true,
    createdPdf: null as null|TCreatedPdf,
    pdfDataUrl: '',
    paperSizeInfo: computed<PaperSizeInfo>(() => {
        const paperSizeInfo = paperSizeInfoMap[props.paperSize];
        if (props.orientation === 'landscape') return { width: paperSizeInfo.height, height: paperSizeInfo.width };
        return paperSizeInfo;
    }),
    isMakingContentsStarted: false,
    isMakingPdfStarted: false,
    progressRate: 0,
    font: computed<PdfFontFamily>(() => {
        if (fontLanguages.ja === props.fontLanguage) return pdfFontFamily.NotoSansJp;
        if (fontLanguages.ko === props.fontLanguage) return pdfFontFamily.NotoSansKo;
        return pdfFontFamily.NotoSans;
    }),
});

let fakeRateInterval;
const addRate = () => {
    fakeRateInterval = setInterval(() => {
        let limit = COMPLETED_ELEMENT_RATE;
        if (state.isMakingContentsStarted) limit = COMPLETED_IMAGE_RATE;
        else if (state.isMakingPdfStarted) limit = COMPLETED_PDF_RATE;
        if (state.progressRate < limit) state.progressRate++;
        if (state.progressRate >= COMPLETED_PDF_RATE) clearInterval(fakeRateInterval);
    }, 10);
};
const resetRate = () => {
    if (fakeRateInterval) {
        clearInterval(fakeRateInterval);
        fakeRateInterval = undefined;
        state.progressRate = 0;
    }
};

const setVisible = (value: boolean) => {
    state.proxyVisible = value;
    emit('update:visible', value);
};

const applyTableHeaderStyle = (data: TableCell[][]): TableCell[][] => {
    try {
        let tableData = data;
        if (tableData[0]) {
            tableData[0] = tableData[0].map((item) => ({
                text: item,
                style: 'tableHeader',
            }));
            // check if no items
            if (!tableData[1]) {
                const colsLength = tableData[0].length;
                const emptyCell = {
                    text: 'No Items', rowSpan: EMPTY_ROW_COUNT, colSpan: colsLength, alignment: 'center', style: 'noDataRow',
                };
                // add first row
                tableData.push(tableData[0].map((_, i) => {
                    if (i === 0) return emptyCell;
                    return '';
                }));
                // add blank rows
                const fakeRows = new Array(EMPTY_ROW_COUNT - 1).fill(new Array(colsLength).fill(''));
                tableData = tableData.concat(fakeRows);
            }
        }
        return tableData;
    } catch (e) {
        console.error(e);
        return [[]];
    }
};

const createContentWithItem = async ({ element, type, tableData }: Item): Promise<Content> => {
    try {
        if (type === 'data-table' && tableData) {
            if (!tableData.body) throw Error('[PdfDownloadOverlay] data-table type item must have data.');
            const tableBody = applyTableHeaderStyle(tableData.body);

            return tableData.body.length ? {
                pageBreak: 'before',
                table: {
                    headerRows: 1,
                    widths: tableData.widths,
                    body: tableBody,
                },
                fillColor: white,
                margin: [0, 4],
                layout: 'DataTable',
            } : {} as Content;
        }

        // 'image' is default type
        if (!element) throw Error('[PdfDownloadOverlay] image type item must have element.');
        const imageUrl = await toPng(element);
        if (!imageUrl.split(':')[1]?.split(',')[1]) {
            return {} as Content;
        }
        return {
            image: imageUrl,
            width: state.paperSizeInfo.width - (PAGE_PADDING * 2),
            style: 'imageRowWrapper',
        };
    } catch (e) {
        console.error(e);
        return '';
    }
};

const makeTableLayouts = () => ({
    DataTable: {
        hLineWidth: (i, node) => {
            if (i === node.table.body.length) return 0;
            return 1;
        },
        vLineWidth: () => 0,
        hLineColor: (i) => (i === 0 || i === 1 ? black : gray[300]),
        paddingLeft: (i) => (i === 0 ? 8 : 2),
        paddingTop: (i) => {
            if (i === 0) return 4;
            return 6;
        },
        // eslint-disable-next-line no-unsafe-optional-chaining
        paddingRight: (i, node) => (node?.table.widths.length - 1 === i ? 6 : 8),
        paddingBottom: (i) => {
            if (i === 0) return 4;
            return 6;
        },
    },
});
const createPdfWithContents = (contents: Content[]) => {
    const tableLayouts = makeTableLayouts();
    return pdfMake.createPdf({
        info: {
            title: props.fileName,
        },
        pageSize: props.paperSize,
        pageOrientation: props.orientation,
        pageMargins: PAGE_PADDING,
        content: contents,
        background: () => ({
            canvas: [
                {
                    type: 'rect',
                    x: 0,
                    y: 0,
                    w: state.paperSizeInfo.width,
                    h: state.paperSizeInfo.height,
                    color: gray[100],
                },
            ],
        }),
        styles: {
            imageRowWrapper: {
                margin: [0, IMAGE_ROW_MARGIN_Y],
            },
            tableHeader: {
                bold: true,
                color: black,
            },
            noDataRow: {
                bold: true,
                color: gray[300],
            },
        },
        defaultStyle: {
            font: state.font,
            fontSize: 9,
        },
    }, tableLayouts, pdfFontInfoMap);
};

const makePdfWithItems = async (items: Item[]) => {
    state.loading = true;
    try {
        state.isMakingContentsStarted = true;
        const contents: Content[] = await Promise.all(items.map((item) => createContentWithItem(item)));
        state.progressRate = COMPLETED_IMAGE_RATE;

        state.isMakingPdfStarted = true;
        state.createdPdf = createPdfWithContents(contents);
        state.progressRate = COMPLETED_PDF_RATE;

        if (props.mode === 'PDF_EMBED') {
            state.createdPdf.getDataUrl((pdfDataUrl) => {
                state.pdfDataUrl = pdfDataUrl;
                state.loading = false;
            });
        } else if (props.mode === 'PDF_NEW_TAB') {
            try {
                state.createdPdf.open();
                setVisible(false);
                state.loading = false;
            } catch (e) {
                // eslint-disable-next-line no-alert
                alert(e);
            }
        } else {
            state.loading = false;
        }
    } catch (e) {
        console.error(e);
        state.loading = false;
    }
};

/* Events */
const handleClickCancel = () => {
    setVisible(false);
};
const handleClickDownload = () => {
    if (!state.createdPdf) return;
    state.createdPdf.download(props.fileName);
};

/* Watchers */
watch(() => props.items, async (items) => {
    if (!items.length) return;
    state.createdPdf = null;
    state.pdfDataUrl = '';
    await makePdfWithItems(items);
    state.progressRate = COMPLETED_ELEMENT_RATE;
});
watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) {
        // reset states
        state.proxyVisible = visible;
        state.loading = true;
        state.createdPdf = null;
        state.pdfDataUrl = '';
        state.progressRate = 0;
        state.isMakingContentsStarted = false;
        state.isMakingPdfStarted = false;
    }
});
watch(() => state.loading, (loading) => {
    if (loading) addRate();
    else resetRate();
}, { immediate: true });

</script>

<template>
    <div v-if="visible"
         class="pdf-download-overlay"
    >
        <div class="header-wrapper">
            <span class="title">{{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PDF.PDF_PREVIEW') }}</span>
            <div class="button-group">
                <p-button style-type="tertiary"
                          @click="handleClickCancel"
                >
                    {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PDF.CANCEL') }}
                </p-button>
                <p-button v-if="mode === 'ELEMENT_EMBED'"
                          icon-left="ic_download"
                          style-type="primary"
                          :loading="state.loading"
                          @click="handleClickDownload"
                >
                    {{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PDF.DOWNLOAD_PDF') }}
                </p-button>
            </div>
        </div>
        <div v-if="mode === 'PDF_EMBED' ? (state.loading && !state.pdfDataUrl) : true"
             class="preview-wrapper"
        >
            <div class="preview">
                <div class="blocker">
                    <slot name="default" />
                </div>
            </div>
        </div>
        <div v-if="state.loading"
             class="loader-wrapper"
        >
            <div class="loader">
                <p-spinner size="sm" />
                <div class="progress-rate">
                    {{ state.progressRate }}%
                </div>
                <span>{{ t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.PDF.PROCESSING') }}...</span>
            </div>
        </div>
        <iframe v-if="mode === 'PDF_EMBED' && state.pdfDataUrl"
                :src="state.pdfDataUrl"
        />
    </div>
</template>

<style lang="postcss" scoped>
.pdf-download-overlay {
    @apply bg-gray-800;
    $header-height: 3.5rem;
    $z-index: 999;
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: $z-index;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .header-wrapper {
        @apply bg-gray-900;
        flex-shrink: 0;
        height: $header-height;
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 1.25;
        padding-left: 1.5rem;
        padding-right: 2.5rem;
        .title {
            @apply text-white;
            font-weight: bold;
            font-size: 1.125rem;
        }
        .p-icon-text-button {
            margin-left: 1rem;
        }
    }
    .preview-wrapper {
        padding: 2rem;
        flex-shrink: 0;
        flex-grow: 1;
        overflow-y: auto;
        height: calc(100% - $header-height);
        box-sizing: border-box;
        .preview {
            @apply bg-gray-100;
            padding: 1.5rem;
            overflow-x: scroll;
            width: 1366px;
            .blocker {
                pointer-events: none;
            }
        }
    }
    .loader-wrapper {
        @apply bg-gray-800;
        position: absolute;
        top: $header-height;
        left: 0;
        height: calc(100vh - $header-height);
        width: 100%;
        z-index: $z-index;
        padding-top: 4.5rem;
        .loader {
            @apply text-gray-400;
            font-size: 1.125rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            .progress-rate {
                margin-top: 0.5rem;
                margin-bottom: 1rem;
            }
        }
    }
    iframe {
        @apply bg-gray-800;
        position: absolute;
        z-index: $z-index;
        top: $header-height;
        flex-grow: 1;
        height: calc(100vh - $header-height);
        width: 100%;
    }
}
</style>
