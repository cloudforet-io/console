<template>
    <div class="p-text-editor">
        <p-data-loader :data="true"
                       :loading="loading"
                       disable-empty-case
                       show-data-from-scratch
                       loader-backdrop-color="gray.900"
        >
            <textarea ref="textareaRef"
                      name="codemirror"
                      placeholder=""
            />
        </p-data-loader>
    </div>
</template>


<script setup lang="ts">
/**
  * Used library: codemirror
  * https://github.com/codemirror/codemirror5
* */

/**
 * PTextEditor can get any types,
 * CodeMirror can get String ONLY
 */


import type { EditorConfiguration } from 'codemirror';
import CodeMirror from 'codemirror';
import { forEach } from 'lodash';
import {
    computed, nextTick,
    toRef, onBeforeUnmount,
    reactive, watch,
} from 'vue';

import PDataLoader from '@/feedbacks/loading/data-loader/PDataLoader.vue';

import('codemirror/mode/javascript/javascript');
import('codemirror/addon/fold/brace-fold');
import('codemirror/addon/fold/comment-fold');
import('codemirror/addon/fold/foldcode');
import('codemirror/addon/fold/foldgutter');
import('codemirror/addon/fold/indent-fold');
import('codemirror/addon/fold/markdown-fold');
import('codemirror/addon/fold/xml-fold');
import('codemirror/addon/lint/json-lint');
import('codemirror/addon/edit/closebrackets');
import('codemirror/addon/edit/closetag');

interface Props {
    code: string|Record<string, any>|Array<any>;
    options: EditorConfiguration;
    readOnly: boolean;
    loading: boolean;
    folded: boolean;
    highlightLines?: Array<number>;
    disableAutoReformat?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    code: '',
    options: () => ({
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
    readOnly: false,
    loading: false,
    folded: false,
    highlightLines: () => [],
    disableAutoReformat: false,
});
const emit = defineEmits(['update:code']);

const state = reactive({
    content: '',
    cmInstance: null as CodeMirror.Editor|null,
    textareaRef: null as HTMLTextAreaElement|null,
    mergedOptions: computed<EditorConfiguration>(() => ({ ...props.options, readOnly: props.readOnly })),
});
const textareaRef = toRef(state, 'textareaRef');

const refineCode = (code: any): string => {
    if (typeof code === 'string') {
        const trimmedCode = code.trim();
        if (trimmedCode.startsWith('{') || trimmedCode.startsWith('[')) {
            try {
                // Object encased in String
                // "{height: 182}"
                const obj = JSON.parse(trimmedCode);
                if (props.disableAutoReformat) return code;

                return JSON.stringify(obj, undefined, 4);
            } catch {
                // Looks like Object encased in String, BUT Pure String
                // "{haha}"
                return code;
            }
        }
        // Pure String
        // "haha"
        return code;
    }
    // Object, null, undefined, Number
    return JSON.stringify(code, undefined, 4);
};

const forceFold = (cmInstance) => {
    if (props.folded && cmInstance && props.code && cmInstance.foldCode) {
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
            marker.innerHTML = '৹';
            return marker;
        })());
        cmInstance.addLineClass(line, 'wrap', 'CodeMirror-activeline');
        cmInstance.addLineClass(line, 'background', 'CodeMirror-activeline-background');
        cmInstance.addLineClass(line, 'gutter', 'CodeMirror-activeline-gutter');
    });
};

const refresh = (cmInstance) => {
    nextTick(() => {
        cmInstance.refresh();
    });
};

const destroy = (cmInstance) => {
    // garbage cleanup
    const element = cmInstance?.doc?.cm?.getWrapperElement();
    if (element?.remove) element.remove();
    state.cmInstance = null;
};

const init = (_textareaRef: HTMLTextAreaElement) => {
    const editor = CodeMirror.fromTextArea(_textareaRef, state.mergedOptions);

    watch(() => state.mergedOptions, (options) => {
        if (options && editor) {
            forEach(options, (d, k) => {
                editor.setOption(k as keyof EditorConfiguration, d);
            });
        }
    }, { deep: true });

    editor.on('change', (cm) => {
        emit('update:code', cm.getValue());
    });

    state.cmInstance = editor;
};

watch([() => state.textareaRef, () => props.code, () => props.disableAutoReformat], ([_textareaRef, code]) => {
    if (!_textareaRef) return;
    if (!state.cmInstance) init(_textareaRef);

    setCode(state.cmInstance, refineCode(code));
    if (props.highlightLines) setHighlightLines(state.cmInstance, props.highlightLines);
    forceFold(state.cmInstance);
    refresh(state.cmInstance);
}, { immediate: true });

onBeforeUnmount(() => {
    destroy(state.cmInstance);
});

</script>

<style lang="postcss">
@import 'codemirror/lib/codemirror.css';
@import 'codemirror/theme/dracula.css';
@import 'codemirror/addon/lint/lint.css';
@import 'codemirror/addon/fold/foldgutter.css';
.p-text-editor {
    height: 100%;
    min-height: 5rem;
    > .p-data-loader {
        min-height: inherit;
        > .data-loader-container {
            min-height: inherit;
            > .data-wrapper {
                min-height: inherit;
                > textarea {
                    display: none;
                }

                > .CodeMirror {
                    .CodeMirror-addedline {
                        width: 1rem;
                    }

                    .CodeMirror-gutters {
                        border-right: 0.03rem solid rgba(109, 138, 136, 50%);
                    }

                    .CodeMirror-activeline-gutter, .CodeMirror-activeline-background {
                        background-color: rgba(255, 255, 222, 30%);
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
            }
        }
    }
}
</style>
