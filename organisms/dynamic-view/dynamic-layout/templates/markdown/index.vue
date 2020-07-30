<template>
    <div v-if="!isLoading" class="s-dynamic-layout-markdown">
        <p-panel-top v-if="showTitle">
            {{ name }}
        </p-panel-top>
        <p-mark-down :markdown="options.markdown||''" :data="rootData" :language="language" />
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, watch,
} from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { checkCanGetData, DynamicLayoutApiProp } from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import { GetAction, ResourceActions } from '@/lib/fluent-api';
import PMarkDown from '@/components/molecules/markdown/PMarkDown.vue';
import _ from 'lodash';


export default {
    name: 'SDynamicLayoutItem',
    components: {
        PPanelTop, PMarkDown,
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
                // console.debug('resp', resp);
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

        return {
            rootData,
        };
    },
};
</script>
