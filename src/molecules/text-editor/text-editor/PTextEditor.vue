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
            <textarea ref="textarea"
                      name="codemirror"
                      placeholder=""
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
    ComponentRenderProxy, computed,
    getCurrentInstance, onBeforeUnmount,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import CodeMirror from 'codemirror';

import { forEach } from 'lodash';
import PLottie from '@/molecules/lottie/PLottie.vue';
import { modes } from '@/molecules/text-editor/text-editor/config';

let isAddonsImported = false;

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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            content: '',
            cminstance: null as any,
            textarea: null as any,
            mergedOptions: computed(() => ({ ...props.options, readOnly: props.mode === 'readOnly' })),
        });

        const forceFold = () => {
            if (props.mode === 'readOnly' && state.cminstance && props.code) {
                state.cminstance.operation(() => {
                    for (let l = state.cminstance.firstLine() + 1;
                        l <= state.cminstance.lastLine(); ++l) {
                        state.cminstance.foldCode({ line: l, ch: 0 }, null, 'fold');
                    }
                });
            }
        };

        const onCmCodeChange = (newCode) => {
            emit('update:code', newCode);
            forceFold();
        };

        const handleCodeChange = (newVal) => {
            const cmValue = state.cminstance.getValue();
            if (newVal !== cmValue) {
                const scrollInfo = state.cminstance.getScrollInfo();
                state.cminstance.setValue(newVal);
                state.content = newVal;
                state.cminstance.scrollTo(scrollInfo.left, scrollInfo.top);
            }
        };

        const refresh = () => {
            vm.$nextTick(() => {
                state.cminstance.refresh();
            });
        };

        const destroy = (cminstance) => {
            // garbage cleanup
            const element = cminstance?.doc?.cm?.getWrapperElement();
            if (element?.remove) element.remove();
        };

        const importAddons = async () => {
            await Promise.all([
            import('codemirror/mode/javascript/javascript'),
            import('codemirror/addon/fold/brace-fold'),
            import('codemirror/addon/fold/comment-fold'),
            import('codemirror/addon/fold/foldcode'),
            import('codemirror/addon/fold/foldgutter'),
            import('codemirror/addon/fold/indent-fold'),
            import('codemirror/addon/fold/markdown-fold'),
            import('codemirror/addon/fold/xml-fold'),
            import('codemirror/addon/lint/json-lint'),
            import('codemirror/addon/edit/closebrackets'),
            import('codemirror/addon/edit/closetag'),
            ]);
        };

        const init = async () => {
            if (!isAddonsImported) {
                await importAddons();
                isAddonsImported = true;
            }
            state.cminstance = CodeMirror.fromTextArea(state.textarea, state.mergedOptions);

            watch(() => state.mergedOptions, (options) => {
                if (options && state.cminstance) {
                    forEach(options, (d, k) => {
                        state.cminstance.setOption(k, d);
                    });
                }
            }, { deep: true });

            state.cminstance.on('change', (cm) => {
                state.content = cm.getValue();
                onCmCodeChange(state.content);
            });

            watch(() => props.code, (newVal) => {
                handleCodeChange(newVal);
            }, { immediate: true });

            forceFold();

            // prevents funky dynamic rendering
            refresh();
        };


        watch(() => state.textarea, async (after, before) => {
            if (after) {
                await init();
            } else {
                destroy(before);
            }
        });


        onBeforeUnmount(() => {
            destroy(state.cminstance);
        });


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
