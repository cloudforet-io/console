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
        <div v-if="!loading">
            <codemirror ref="editor"
                        v-model="proxyCode"
                        :options="options"
                        :mode="mode"
            />
        </div>
    </div>
</template>

<script lang="ts">
/**
  * Used library: codemirror
  * https://github.com/surmon-china/vue-codemirror#readme
* */

import {
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { codemirror } from 'vue-codemirror';


import { makeProxy } from '@/util/composition-helpers';
import PLottie from '@/molecules/lottie/PLottie.vue';
import { modes } from '@/molecules/text-editor/text-editor/config';



const importAddons = async () => {
    await Promise.all([
        import(/* webpackMode: "eager" */ 'codemirror/mode/javascript/javascript'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/fold/brace-fold'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/fold/comment-fold'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/fold/foldcode'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/fold/foldgutter'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/fold/indent-fold'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/fold/markdown-fold'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/fold/xml-fold'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/lint/json-lint'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/edit/closebrackets'),
        import(/* webpackMode: "eager" */ 'codemirror/addon/edit/closetag'),
    ]);
};

export default {
    name: 'PTextEditor',
    components: { codemirror, PLottie },
    props: {
        code: {
            type: String,
            default: '',
            required: true,
        },
        options: {
            type: Object,
            default: () => ({
                tabSize: 4,
                styleActiveLine: true,
                lineNumbers: true,
                line: true,
                mode: 'application/json',
                lineWrapping: true,
                theme: 'ayu-mirage',
                matchBrackets: true,
                autoCloseBrackets: true,
                autoCloseTags: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            }),
        },
        mode: {
            type: String,
            default: 'edit',
            validator(mode) {
                return modes.includes(mode);
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        let isAddonsImported = false;
        const state = reactive({
            proxyCode: makeProxy('code', props, emit),
            editor: null as any,
        });
        watch([() => props.code, () => state.editor], async ([code, editor]) => {
            if (props.mode === 'readOnly' && editor && code) {
                if (!isAddonsImported) {
                    await importAddons();
                    isAddonsImported = true;
                }

                const cm = editor.codemirror;
                cm.operation(() => {
                    for (let l = cm.firstLine() + 1; l <= cm.lastLine(); ++l) {
                        if (!cm.foldCode) console.debug('no foldCode', state.editor)
                        cm.foldCode({ line: l, ch: 0 }, null, 'fold');
                    }
                });
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss">
@import 'codemirror/lib/codemirror.css';
@import 'codemirror/theme/ayu-mirage.css';
@import 'codemirror/addon/lint/lint.css';
@import 'codemirror/addon/fold/foldgutter.css';
.p-text-editor {
    height: 100%;
    min-height: 5rem;
    .CodeMirror {
        font-family: Inconsolata, monospace;
        line-height: 1.5;
        height: fit-content;
        margin: 1rem;
        padding: 1rem;
    }
    position: relative;
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
