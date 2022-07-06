<template>
    <div class="p-text-editor">
        <transition name="fade-in">
            <div v-if="loading" class="loader w-full h-full">
                <slot name="loader" :loading="loading">
                    <p-lottie name="thin-spinner"
                              auto
                              :size="2.5"
                              class="flex items-center justify-center"
                    />
                </slot>
            </div>
        </transition>
        <textarea ref="textareaRef"
                  name="codemirror"
                  placeholder=""
        />
    </div>
</template>


<script lang="ts">
/**
  * Used library: codemirror
  * https://github.com/codemirror/codemirror5
* */
import {
    ComponentRenderProxy, computed, defineComponent,
    getCurrentInstance, onBeforeUnmount, PropType,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import CodeMirror, { EditorConfiguration } from 'codemirror';
import { forEach } from 'lodash';

import PLottie from '@/foundation/lottie/PLottie.vue';

import { textEditorModes, TextEditorMode } from './config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/fold/brace-fold');
require('codemirror/addon/fold/comment-fold');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/indent-fold');
require('codemirror/addon/fold/markdown-fold');
require('codemirror/addon/fold/xml-fold');
require('codemirror/addon/lint/json-lint');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/edit/closetag');

interface Props {
    code: string;
    options: EditorConfiguration;
    mode: TextEditorMode;
    loading: boolean;
    folded: boolean;
    highlightLines?: Array<number>;
}

export default defineComponent<Props>({
    name: 'PTextEditor',
    components: { PLottie },
    props: {
        code: {
            type: String,
            default: '',
            required: true,
        },
        options: {
            type: Object as PropType<EditorConfiguration>,
            default: () => ({
                tabSize: 4,
                styleActiveLine: true,
                lineNumbers: true,
                line: true,
                mode: 'application/json',
                lineWrapping: true,
                theme: 'dracula',
                matchBrackets: true,
                autoCloseBrackets: true,
                autoCloseTags: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-addedline', 'CodeMirror-foldgutter'],
            }),
        },
        mode: {
            type: String as PropType<TextEditorMode>,
            default: 'edit',
            validator(mode: TextEditorMode) {
                return textEditorModes.includes(mode);
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
        folded: {
            type: Boolean,
            default: false,
        },
        highlightLines: {
            type: Array as PropType<Array<number>>,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            content: '',
            cmInstance: null as any,
            textareaRef: null as HTMLTextAreaElement|null,
            mergedOptions: computed(() => ({ ...props.options, readOnly: props.mode === 'readOnly' })),
        });

        const forceFold = (cmInstance) => {
            if (props.folded && cmInstance && props.code) {
                cmInstance.operation(() => {
                    for (let l = cmInstance.firstLine() + 1;
                        l <= cmInstance.lastLine(); ++l) {
                        cmInstance.foldCode({ line: l, ch: 0 }, null, 'fold');
                    }
                });
            }
        };

        const setCode = (cmInstance, code) => {
            if (code !== cmInstance.getValue()) {
                const scrollInfo = cmInstance.getScrollInfo();
                cmInstance.setValue(code);
                cmInstance.scrollTo(scrollInfo.left, scrollInfo.top);
            }
        };

        const setHighlightLines = (cmInstance, lines: Array<number>|undefined) => {
            forEach(lines, (line) => {
                cmInstance.setGutterMarker(line, 'CodeMirror-addedline', (() => {
                    const marker = document.createElement('span');
                    marker.innerHTML = '+';
                    return marker;
                })());
                cmInstance.addLineClass(line, 'wrap', 'CodeMirror-activeline');
                cmInstance.addLineClass(line, 'background', 'CodeMirror-activeline-background');
                cmInstance.addLineClass(line, 'gutter', 'CodeMirror-activeline-gutter');
            });
        };

        const refresh = (cmInstance) => {
            vm.$nextTick(() => {
                cmInstance.refresh();
            });
        };

        const destroy = (cmInstance) => {
            // garbage cleanup
            const element = cmInstance?.doc?.cm?.getWrapperElement();
            if (element?.remove) element.remove();
            state.cmInstance = null;
        };

        const init = (textareaRef: HTMLTextAreaElement) => {
            state.cmInstance = CodeMirror.fromTextArea(textareaRef, state.mergedOptions);

            watch(() => state.mergedOptions, (options) => {
                if (options && state.cmInstance) {
                    forEach(options, (d, k) => {
                        state.cmInstance.setOption(k, d);
                    });
                }
            }, { deep: true });

            state.cmInstance.on('change', (cm) => {
                emit('update:code', cm.getValue());
            });
        };

        watch([() => state.textareaRef, () => props.code], async ([textareaRef, code]) => {
            if (!textareaRef) return;
            if (!state.cmInstance) init(textareaRef);
            setCode(state.cmInstance, code);
            if (props.highlightLines) setHighlightLines(state.cmInstance, props.highlightLines);
            forceFold(state.cmInstance);
            refresh(state.cmInstance);
        }, { immediate: true });

        onBeforeUnmount(() => {
            destroy(state.cmInstance);
        });


        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
@import 'codemirror/lib/codemirror.css';
@import 'codemirror/theme/dracula.css';
@import 'codemirror/addon/lint/lint.css';
@import 'codemirror/addon/fold/foldgutter.css';
.p-text-editor {
    position: relative;
    height: 100%;
    min-height: 5rem;
    > textarea {
        display: none;
    }
    > .CodeMirror {
        .CodeMirror-addedline {
            width: 1rem;
        }
        .CodeMirror-gutters {
            border-right: 0.03rem solid rgba(109, 138, 136, 0.5);
        }
        .CodeMirror-activeline-gutter, .CodeMirror-activeline-background {
            background-color: rgba(172, 229, 100, 0.24);
        }
        font-family: Inconsolata, monospace;
        line-height: 1.5;
        height: fit-content;
        padding: 1rem;
        min-height: inherit;
        > .CodeMirror-scroll {
            min-height: inherit;
        }
    }
    .loader {
        position: absolute;
        padding-top: 2rem;
    }
    .fade-in-leave-active, .fade-in-enter-active {
        transition: opacity 0.5s;
    }
    .fade-in-leave-to, .fade-in-enter {
        opacity: 0;
    }
    .fade-in-enter-to, .fade-in-leave {
        opacity: 1;
    }
}
</style>
