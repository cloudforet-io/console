<template>
    <div v-if="names.length >= 1" class="s-dynamic-subdata my-8">
        <p-select-btn-group
            class="ml-4"
            :buttons="buttons" :selected.sync="selected"
        />
        <SDynamicLayout v-bind="selectedLayout" :api="api" :is-show="isShow" />
    </div>

    <p-empty v-else class="my-8">
        No data
    </p-empty>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, defineComponent, ref,
} from '@vue/composition-api';
import _ from 'lodash';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import {
    ListAction,
    ResourceActions,
    SingleItemAction,
} from '@/lib/fluent-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import { DLSchema } from '@/lib/type';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';

interface Props{
    resourceApi: ResourceActions<any>;
    layouts: DLSchema[];
    selectId: string;
    isShow: boolean;

}

export default defineComponent({
    name: 'SDynamicSubData',
    components: {
        PSelectBtnGroup, PDynamicView, PEmpty, PButton, PPanelTop, SDynamicLayout,
    },
    props: {
        resourceApi: {
            type: Object,
            required: true,
        },
        selectId: {
            type: String,
            required: true,
        },
        layouts: {
            type: Array,
            default: () => ([]as DLSchema[]),
        },
        isShow: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: Props) {
        const state = reactive({
            names: computed(() => props.layouts.map((layout: DLSchema) => layout.name)),
            layoutData: computed(() => _.zipObject(state.names, props.layouts)),
        });
        const api = computed(() => {
            console.debug('reset api', props.selectId);
            return {
                resource: props.resourceApi,
                getAction: (action) => {
                    if (action instanceof SingleItemAction) {
                        return action.setId(props.selectId);
                    }
                    return action;
                },
            };
        });
        const selected = ref(state.names[0]);
        const selectedLayout = computed<DLSchema>(() => {
            const data = state.layoutData[selected.value];
            console.log(data);
            return data;
        });
        const buttons = computed(() => state.names.map(name => ({
            name, label: name, vbind: { styleType: 'gray900-hover', outline: selected.value !== name },
        })));


        return {
            ...toRefs(state),
            selected,
            buttons,
            selectedLayout,
            api,


        };
    },
});
</script>
