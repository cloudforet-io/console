<template>
    <div v-if="visible" class="pdf-download-overlay">
        <div class="header-wrapper">
            <span class="title">PDF preview</span>
            <div class="button-group">
                <p-button style-type="gray-border" :outline="true"
                          @click="handleClickCancel"
                >
                    Cancel
                </p-button>
                <p-icon-text-button v-if="mode === 'ELEMENT_EMBED'" name="ic_download"
                                    style-type="secondary-dark"
                                    :loading="loading"
                                    @click="handleClickDownload"
                >
                    Download PDF
                </p-icon-text-button>
            </div>
        </div>
        <div v-if="mode === 'PDF_EMBED' ? (loading && !pdfDataUrl) : true" class="preview-wrapper">
            <div class="preview">
                <div class="blocker">
                    <slot name="default" />
                </div>
            </div>
        </div>
        <iframe v-if="mode === 'PDF_EMBED' && pdfDataUrl" :src="pdfDataUrl" />
        <div v-if="loading" class="loader-wrapper">
            <div class="loader">
                <p-i name="ic_working" animation="spin"
                     width="2.5rem" height="2.5rem"
                />
                <div class="progress-rate">
                    {{ progressRate }}%
                </div>
                <span>Processing...</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButton, PIconTextButton, PI } from '@spaceone/design-system';

import { toPng } from 'html-to-image';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { TCreatedPdf } from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// eslint-disable-next-line import/extensions,import/no-unresolved
import { Content, TableCell } from 'pdfmake/interfaces';
import { gray } from '@/styles/colors';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

const paperSizes = ['A4'] as const;
const modes = ['ELEMENT_EMBED', 'PDF_EMBED', 'PDF_NEW_TAB'] as const;
const PAGE_PAD_X = 12;
const PAGE_PAD_Y = 40;
const IMAGE_ROW_MARGIN_Y = 4;
const orientations = ['portrait', 'landscape'] as const;
const paperSizeInfoMap: Record<PaperSize, PaperSizeInfo> = Object.freeze({
    A4: { width: 595.28, height: 841.89 },
});

type PaperSize = typeof paperSizes[number];
type Mode = typeof modes[number]
type Orientation = typeof orientations[number]
type PaperSizeInfo = {width: number; height: number}

type ItemType = 'data-table'|'image'

export interface Item {
    element: HTMLElement;
    // default type is 'image'
    type?: ItemType;
}

interface Props {
    visible: boolean;
    mode: Mode;
    items: Array<Item>;
    paperSize: PaperSize;
    orientation: Orientation;
    fileName: string;
}

const COMPLETED_ELEMENT_RATE = 70;
const COMPLETED_IMAGE_RATE = 90;
const COMPLETED_PDF_RATE = 100;

export default defineComponent<Props>({
    name: 'PdfDownloadOverlay',
    components: {
        PButton,
        PIconTextButton: PIconTextButton as any,
        PI,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        mode: {
            type: String as PropType<Mode>,
            default: 'PDF_EMBED',
            validator(mode: Mode) {
                return modes.includes(mode);
            },
        },
        items: {
            type: Array as PropType<Array<HTMLElement|Item>>,
            default: () => [],
        },
        paperSize: {
            type: String as PropType<PaperSize>,
            default: 'A4',
            validator(paperSize: PaperSize) {
                return paperSizes.includes(paperSize);
            },
        },
        orientation: {
            type: String as PropType<Orientation>,
            default: 'portrait',
            validator(orientation: Orientation) {
                return orientations.includes(orientation);
            },
        },
        fileName: {
            type: String,
            default: 'report',
        },
    },
    setup(props, { emit }) {
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
            isElementRendered: computed(() => !!props.items.length),
            isImageConvertingStarted: false,
            isPdfConvertingStarted: false,
            progressRate: 0,
        });

        const addRate = () => {
            const fakeRate = setInterval(() => {
                let limit = COMPLETED_ELEMENT_RATE;
                if (state.isImageConvertingStarted) limit = COMPLETED_IMAGE_RATE;
                else if (state.isPdfConvertingStarted) limit = COMPLETED_PDF_RATE;
                if (state.progressRate < limit) state.progressRate++;
                if (state.progressRate >= COMPLETED_PDF_RATE) clearInterval(fakeRate);
            }, 1);
        };
        const setVisible = (value: boolean) => {
            state.proxyVisible = value;
            emit('update:visible', value);
        };

        const getTableRowsFromElement = (element: HTMLElement) => {
            const tableElement = element.querySelector('table');

            const headRows: TableCell[][] = [];
            const bodyRows: TableCell[][] = [];

            if (tableElement) {
                const theadElements = tableElement.querySelectorAll('thead');
                theadElements.forEach((theadElement) => {
                    const thElements = theadElement.querySelectorAll('th');
                    headRows.push(Array.from(thElements)
                        .map(th => th?.textContent?.trim() ?? ''));
                });

                const trElements = tableElement.querySelector('tbody')
                        ?.querySelectorAll('tr');
                if (trElements) {
                    trElements.forEach((trElement) => {
                        const tdElements = trElement.querySelectorAll('td');
                        const tdCells = Array.from(tdElements)
                            .map(td => td?.textContent?.trim() ?? '');
                        bodyRows.push(tdCells);
                    });
                }
            }

            return { headRows, bodyRows };
        };

        const createContentWithItem = async ({ element, type }: Item): Promise<Content> => {
            if (type === 'data-table') {
                const { headRows, bodyRows } = getTableRowsFromElement(element);
                const body = [
                    ...headRows,
                    ...bodyRows,
                ];
                return body.length ? {
                    table: {
                        headerRows: headRows.length,
                        body,
                    },
                } : {} as Content;
            }

            // 'image' is default type
            const imageUrl = await toPng(element);
            return {
                image: imageUrl,
                width: state.paperSizeInfo.width - (PAGE_PAD_X * 2),
                style: 'imageRowWrapper',
            };
        };

        const createPdfWithContents = (contents: Content[]) => pdfMake.createPdf({
            pageSize: props.paperSize,
            pageOrientation: props.orientation,
            pageMargins: [PAGE_PAD_X, PAGE_PAD_Y],
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
            },
        });

        const makePdfWithItems = async (items: Item[]) => {
            state.loading = true;
            state.isImageConvertingStarted = true;
            const contents: Content[] = await Promise.all(items.map(item => createContentWithItem(item)));
            state.progressRate = COMPLETED_IMAGE_RATE;

            state.isPdfConvertingStarted = true;
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
            state.progressRate = COMPLETED_ELEMENT_RATE;
            await makePdfWithItems(items);
        });
        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) {
                // reset states
                state.loading = true;
                state.createdPdf = null;
                state.pdfDataUrl = '';
                state.proxyVisible = visible;
                state.progressRate = 0;
                state.isImageConvertingStarted = false;
                state.isPdfConvertingStarted = false;
            }
            if (visible) addRate();
        });

        return {
            ...toRefs(state),
            handleClickCancel,
            handleClickDownload,
        };
    },
});
</script>

<style lang="postcss" scoped>
.pdf-download-overlay {
    @apply bg-gray-800;
    $header-height: 3.5rem;
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 999;
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
        z-index: 999;
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
            .p-lottie {
                margin-bottom: 1rem;
            }
        }
    }
    iframe {
        flex-grow: 1;
        height: calc(100vh - $header-height);
        width: 100%;
    }
}
</style>
