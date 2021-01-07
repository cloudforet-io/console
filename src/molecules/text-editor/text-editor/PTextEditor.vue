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
                        :value="code"
                        :options="options"
                        :mode="mode"
                        @ready="onCmReady"
                        @input="onCmCodeChange"
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
    reactive, toRefs,
} from '@vue/composition-api';

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

import PLottie from '@/molecules/lottie/PLottie.vue';
import { modes } from '@/molecules/text-editor/text-editor/config';

export default {
    name: 'PTextEditor',
    components: { PLottie },
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
        const state = reactive({
            editor: null as any,
            cm: null as any,
        });

        const forceFold = () => {
            if (props.mode === 'readOnly' && state.cm && props.code) {
                state.cm.operation(() => {
                    for (let l = state.cm.firstLine() + 1; l <= state.cm.lastLine(); ++l) {
                        state.cm.foldCode({ line: l, ch: 0 }, null, 'fold');
                    }
                });
            }
        };
        const onCmReady = (cm) => {
            state.cm = cm;
            forceFold();
        };

        const onCmCodeChange = (newCode) => {
            emit('update:code', newCode);
            forceFold();
        };

        return {
            ...toRefs(state),
            onCmReady,
            onCmCodeChange,
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
