<template>
    <div v-if="!isLoading">
        <p-panel-top
            v-if="showTitle"
            :use-total-count="true"
            :total-count="items? items.length:0"
        >
            {{ name }}
        </p-panel-top>
        <p-data-table :items="items" :fields="fields" :col-copy="colCopy"
                      :responsive-style="responsiveStyle"
                      v-on="$listeners"
        >
            <template v-for="slot of slots" v-slot:[slot.name]="{value}">
                <p-dynamic-field :key="slot.key" v-bind="slot" :data="value" />
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import {
    checkCanGetData,
    DynamicLayoutApiProp,
    DynamicLayoutProps,
    makeFields, makeTableSlots,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import { GetAction, ResourceActions } from '@/lib/fluent-api';


export default {
    name: 'SDynamicLayoutSimpleTable',
    components: {
        PDynamicField,
        PDataTable,
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
        colCopy: {
            type: Boolean,
            default: false,
        },
        responsiveStyle: {
            type: Object,
            default: () => ({ height: '24rem', 'overflow-y': 'auto' }),
        },
    },
    setup(props: DynamicLayoutProps) {
        const state = reactive({
            isApiMode: computed(() => !!props.api),
            data: {},
        });
        const fields = makeFields(props);


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
        const items = computed(() => {
            if (props.options.root_path) {
                return _.get(readonlyData.value, props.options.root_path, []);
            }
            return readonlyData.value;
        });
        const slots = makeTableSlots(props);
        return {
            fields,
            slots,
            items,
        };
    },
};
</script>
