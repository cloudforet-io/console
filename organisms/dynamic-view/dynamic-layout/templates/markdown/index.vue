<template>
    <div v-if="!isLoading" class="s-dynamic-layout-markdown">
        <p-panel-top v-if="showTitle">
            {{ name }}
        </p-panel-top>
        <div class="contents" v-html="md" />
    </div>
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, watch,
} from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import nunjucks from 'nunjucks';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/scss/dracula.scss';
import { checkCanGetData, DynamicLayoutApiProp } from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import { GetAction, ResourceActions } from '@/lib/fluent-api';
import _ from 'lodash';
import { useStore } from '@/store/toolset';
import construct from '@babel/runtime-corejs2/helpers/esm/construct';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const marked = require('marked');

export default {
    name: 'SDynamicLayoutItem',
    components: {
        PPanelTop,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, Array],
            default: null,
        },
        api: {
            type: Object,
            default: null,
        },
        isShow: {
            type: Boolean,
            default: true,
        },
        isLoading: {
            type: Boolean,
            required: true,
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
        language: {
            type: String,
            default: 'en',
        },
    },
    setup(props) {
        // const regx = new RegExp('<pre(?:.|\\n)*(?<codeblock><code.*>(?<code>(?:.|\\n)*)</code>)(?:.|\\n)*</pre>');
        const state = reactive({
            isApiMode: computed(() => !!props.api),
            data: {},
        });


        const getData = async () => {
            if (checkCanGetData(props)) {
                let action: GetAction<any, any>;
                if (props.api?.resource instanceof GetAction) {
                    action = props.api.resource;
                } else {
                    action = (props.api?.resource as ResourceActions<'get'>).get() as GetAction<any, any>;
                }
                if (props.api?.getAction) {
                    action = props.api.getAction(action) as GetAction<any, any>;
                }
                if (props.options.root_path) {
                    action = action.setOnly(props.options.root_path);
                }
                const resp = await action.execute();
                console.debug('resp', resp);
                state.data = resp.data || {};
            }
        };
        // const getData = _.debounce(getDataFunc, 50);

        let apiWatchStop: any = null;
        watch(() => state.isApiMode, (after, before) => {
            if (after !== before) {
                if (after) {
                    // @ts-ignore
                    apiWatchStop = watch(() => [props.isShow, props.api], (aft, bef) => {
                        const isShow: boolean = aft[0] as boolean;
                        const beforeIsShow = bef ? bef[0] : false;
                        const afterApi: DynamicLayoutApiProp = aft[1] as DynamicLayoutApiProp;
                        const beforeApi: undefined|DynamicLayoutApiProp = bef ? bef[1] as DynamicLayoutApiProp : undefined;
                        if ((isShow && isShow !== beforeIsShow) || (afterApi.resource !== beforeApi?.resource || afterApi.getAction !== beforeApi?.getAction)) {
                            getData();
                        }
                    });
                } else if (apiWatchStop) {
                    apiWatchStop();
                }
            }
        });

        const readonlyData = computed(() => (state.isApiMode ? state.data : props.data));
        const rootData = computed(() => {
            if (props.options.root_path) {
                return _.get(readonlyData.value, props.options.root_path);
            }
            return readonlyData.value;
        });

        const getI18nMd = (md: any) => {
            const DEFAULT_LANGUAGE = 'en';
            return _.get(md, props.language, md[DEFAULT_LANGUAGE] || Object.values(md)[0]);
        };
        const md = computed(() => {
            if (props.options.markdown) {
                let doc = props.options.markdown;
                if (typeof doc === 'object') {
                    try {
                        doc = getI18nMd(doc);
                    } catch (e) {
                        console.debug(e);
                        return '';
                    }
                }
                console.debug(rootData.value, 'root data');
                if (rootData.value) {
                    doc = nunjucks.renderString(doc, rootData.value);
                }
                const renderMD = marked(doc);
                // console.debug(renderMD);
                // const toHljs = renderMD.replace(regx, (...args) => {
                //     const group = args[args.length - 1];
                //     console.debug(hljs.highlightAuto(group.code));
                //     return `<pre class="hljs">${group.codeblock}</pre>`;
                // });
                // return toHljs;
                const toHljs = renderMD.replace(/<pre>/g, () => '<pre class="hljs">');
                return toHljs;
            }
            return '';
        });
        return {
            md,
        };
    },
};
</script>

<style lang="postcss" >
    .s-dynamic-layout-markdown{
    .contents{
        @apply w-full border-black;
        /*pre{*/
        /*    @apply bg-gray-500 text-white;*/
        /*}*/
        table{
            @apply border border-black;
            thead{
                tr{
                    th {
                        @apply border border-black;
                    }
                    td{
                        @apply border border-black;
                    }
                }
            }
            tbody{
                tr{
                    td{
                        @apply border border-black;
                    }
                    th{
                        @apply border border-black;
                    }
                }

            }

        }

        h1{
            @apply text-4xl font-bold mt-8 mb-1;
            line-height: 100%;
        }
        h2{
            @apply text-3xl font-bold mt-6 mb-1;
            line-height: 100%;
        }
        h3{
            @apply text-2xl font-bold mt-4 mb-1;
            line-height: 100%;
        }
        h4{
            @apply text-xl font-bold mt-2 mb-1;
            line-height: 100%;
        }
        h5{
            @apply text-sm font-bold mb-1;
            line-height: 100%;
        }
        p{
            @apply my-2;
        }
    }
    }


</style>
