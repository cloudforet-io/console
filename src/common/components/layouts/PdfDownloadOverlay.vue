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
                <p-lottie name="thin-spinner" :size="2.5" auto />
                <span>Processing...</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButton, PIconTextButton, PLottie } from '@spaceone/design-system';

import { toPng } from 'html-to-image';
import { createPdf, TCreatedPdf } from 'pdfmake/build/pdfmake';

import { gray } from '@/styles/colors';


const paperSizes = ['A4'] as const;
const modes = ['ELEMENT_EMBED', 'PDF_EMBED', 'PDF_NEW_TAB'] as const;
const PAGE_PAD = 24;
const paperSizeInfoMap: Record<PaperSize, PaperSizeInfo> = Object.freeze({
    A4: { width: 595.28, height: 841.89 },
});

type PaperSize = typeof paperSizes[number];
type Mode = typeof modes[number]
type PaperSizeInfo = {width: number; height: number}

interface Props {
    visible: boolean;
    mode: Mode;
    elements: HTMLElement[];
    paperSize: PaperSize;
    fileName: string;
}

export default defineComponent<Props>({
    name: 'PdfDownloadOverlay',
    components: {
        PButton,
        PIconTextButton: PIconTextButton as any,
        PLottie,
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
        elements: {
            type: Array as PropType<HTMLElement[]>,
            default: () => [],
        },
        paperSize: {
            type: String as PropType<PaperSize>,
            default: 'A4',
            validator(paperSize: PaperSize) {
                return paperSizes.includes(paperSize);
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
        });

        const setVisible = (value: boolean) => {
            state.proxyVisible = value;
            emit('update:visible', value);
        };

        const getPngDataUrlsFromElements = async (elements: HTMLElement[]): Promise<string[]> => {
            const results = await Promise.all(elements.map(el => toPng(el)));
            return results;
        };

        const createPdfWithImageUrls = (imageUrls: string[]): TCreatedPdf => {
            const paperSize = props.paperSize;
            const paperSizeInfo = paperSizeInfoMap[paperSize];

            return createPdf({
                content: imageUrls.map(url => ({
                    image: url,
                    width: paperSizeInfo.width - (PAGE_PAD * 2),
                })),
                pageSize: paperSize,
                background: () => ({
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: paperSizeInfo.width,
                            h: paperSizeInfo.height,
                            color: gray[100],
                        },
                    ],
                }),
            });
        };

        const makePdfWithElements = async (elements: HTMLElement[]) => {
            state.loading = true;
            const imageUrls = await getPngDataUrlsFromElements(elements);
            state.createdPdf = createPdfWithImageUrls(imageUrls);

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
        watch(() => props.elements, async (elements) => {
            if (!elements.length) return;
            await makePdfWithElements(elements);
        });
        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) {
                // reset states
                state.loading = true;
                state.createdPdf = null;
                state.pdfDataUrl = '';
                state.proxyVisible = visible;
            }
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
