<template>
    <div v-if="!isLoading">
        <p-panel-top>{{ name }}</p-panel-top>
        <p-definition-table :items="defs" v-on="$listeners">
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="{...scope, rootData}" />
            </template>
        </p-definition-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import {
    DynamicFieldType,
    DynamicLayoutProps,
    makeDefs,
    DynamicLayoutApiProp, checkCanGetData, changeSetOnlys,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import { GetAction, ResourceActions } from '@/lib/fluent-api';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';


export default {
    name: 'SDynamicLayoutItem',
    components: {
        PPanelTop,
        PDefinitionTable,
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
    },
    setup(props: DynamicLayoutProps) {
        const state = reactive({
            isApiMode: computed(() => !!props.api),
            data: {},
        });
        const fields = computed<DynamicFieldType[]>(() => props.options.fields || []);
        const onlyKeys = computed<string[]>(() => {
            if (props.options.fields) {
                if (props.options.root_path) {
                    return props.options.fields.map(item => `${props.options.root_path}.${item.key}`);
                }
                return props.options.fields.map(item => item.key);
            }
            return [];
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
                if (onlyKeys.value.length) {
                    // @ts-ignore
                    action = action.setOnly(...changeSetOnlys(onlyKeys.value));
                }
                const resp = await action.execute();
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
        const defs = makeDefs(fields, rootData);
        const noData = computed(() => _.every(defs.value, def => !def.data));
        return {
            defs,
            noData,
            rootData,
        };
    },
};
</script>
