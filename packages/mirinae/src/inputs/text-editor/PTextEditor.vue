<script setup lang="ts">
/**
  * Used library: codemirror
  * https://github.com/codemirror/codemirror5
* */

/**
 * PTextEditor can get any types,
 * CodeMirror can get String ONLY
 */
import {
    computed, nextTick, onBeforeUnmount, reactive, watch,
} from 'vue';

import type { EditorConfiguration } from 'codemirror';
import CodeMirror from 'codemirror';
import { forEach, isEqual } from 'lodash';

import PDataLoader from '@/feedbacks/loading/data-loader/PDataLoader.vue';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';

interface Props {
    code?: string|Record<string, any>|Array<any>;
    options?: EditorConfiguration;
    readOnly?: boolean;
    loading?: boolean;
    folded?: boolean;
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

const emit = defineEmits<{(e: 'update:code', value: string): void;
}>();

const state = reactive({
    content: '',
    cmInstance: null as CodeMirror.Editor|null,
    textareaRef: null as HTMLTextAreaElement|null,
    mergedOptions: computed<EditorConfiguration>(() => ({ ...props.options, readOnly: props.readOnly })),
});

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

const forceFold = (cmInstance: CodeMirror.Editor) => {
    if (cmInstance && props.code && cmInstance.foldCode) {
        cmInstance.operation(() => {
            for (let l = cmInstance.firstLine() + 1;
                l <= cmInstance.lastLine(); ++l) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                cmInstance.foldCode({ line: l, ch: 0 }, null, 'fold');
            }
        });
    }
};

const setCode = (cmInstance: CodeMirror.Editor, code: string) => {
    if (code !== cmInstance.getValue()) {
        const scrollInfo = cmInstance.getScrollInfo();
        cmInstance.setValue(code);
        cmInstance.scrollTo(scrollInfo.left, scrollInfo.top);
    }
};

const setHighlightLines = (cmInstance: CodeMirror.Editor, lines: Array<number>|undefined) => {
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

const setOptions = (cmInstance: CodeMirror.Editor, options: EditorConfiguration) => {
    forEach(options, (d, k) => {
        cmInstance.setOption(k as keyof EditorConfiguration, d);
    });
};

const refresh = async (cmInstance: CodeMirror.Editor) => {
    await nextTick();
    cmInstance.refresh();
};

const destroy = (cmInstance: CodeMirror.Editor|null) => {
    // garbage cleanup
    if (!cmInstance) return;
    let element: HTMLElement|null = null;
    if ((cmInstance as any).doc) element = (cmInstance as any).doc?.cm?.getWrapperElement();
    else element = cmInstance.getWrapperElement();
    if (element?.remove) element.remove();
    state.cmInstance = null;
};

const initCodeMirrorInstance = (textareaRef: HTMLTextAreaElement): CodeMirror.Editor => {
    const editor = CodeMirror.fromTextArea(textareaRef, state.mergedOptions);

    editor.on('change', (cm) => {
        emit('update:code', cm.getValue());
    });
    return editor;
};

watch([() => state.textareaRef, () => props.code, () => props.disableAutoReformat, () => state.mergedOptions], async ([textareaRef, code, , options], [,,, prevOptions]) => {
    if (!textareaRef) return;
    if (!state.cmInstance) state.cmInstance = initCodeMirrorInstance(textareaRef);

    const editor = state.cmInstance as CodeMirror.Editor;
    if (!isEqual(options, prevOptions)) setOptions(editor, options);
    setCode(editor, refineCode(code));
    if (props.highlightLines) setHighlightLines(editor, props.highlightLines);
    if (props.folded) forceFold(editor);
    await refresh(editor);
}, { immediate: true });


onBeforeUnmount(() => {
    destroy(state.cmInstance);
});
</script>

<template>
    <div class="p-text-editor">
        <p-data-loader :data="true"
                       :loading="props.loading"
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
        max-height: inherit;
        > .data-loader-container {
            min-height: inherit;
            max-height: inherit;
            > .data-wrapper {
                min-height: inherit;
                max-height: inherit;
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
                        background-color: rgba(255, 255, 222, 0.3);
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
