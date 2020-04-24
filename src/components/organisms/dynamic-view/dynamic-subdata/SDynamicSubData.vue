<template>
    <transition appear>
        <div v-if="names.length >= 1" class="s-dynamic-subdata my-8">
            <p-select-btn-group
                class="ml-4"
                :buttons="buttons" :selected.sync="selected"
            />
            <SDynamicLayout
                v-bind="selectedLayout"
                :api="api"
                :is-show="isShow"
            />
        </div>

        <p-empty v-else class="my-8">
            No data
        </p-empty>
    </transition>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, defineComponent, ref, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { ResourceActions } from '@/lib/fluent-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import { DLSchema } from '@/lib/type';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import SkePSelectBtnGroup from '@/components/molecules/skeletons/SkePSelectBtnGroup.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';

interface Props{
    resourceApi: ResourceActions<any>;
    layouts: DLSchema[];
    selectId: string;
    isShow: boolean;
    isLoading: boolean;

}

export default defineComponent({
    name: 'SDynamicSubData',
    components: {
        PSelectBtnGroup, PDynamicView, PEmpty, PButton, PPanelTop, SDynamicLayout, SkePSelectBtnGroup, PSkeleton,
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
            names: computed(() => props.layouts?.map((layout: DLSchema) => layout.name) || []),
            layoutData: computed(() => _.zipObject(state.names, props.layouts)),
        });
        const api = computed(() => {
            console.debug('reset api', props.selectId);
            return {
                resource: props.resourceApi,
                getAction: (action) => {
                    if (action.setId) {
                        return action.clone().setId(props.selectId);
                    }
                    return action.clone();
                },
            };
        });
        const selected = ref(state.names[0]);
        const selectedLayout = computed<DLSchema>(() => state.layoutData[selected.value]);
        const buttons = computed(() => state.names.map(name => ({
            name, label: name, vbind: { styleType: 'gray900-hover', outline: selected.value !== name },
        })));
        watch(() => state.names, (aft, bef) => {
            console.debug('change state names', state.names, selected.value);
            if (aft && aft.length >= 1 && !_.isEqual(aft, bef) && !new Set(aft).has(selected.value)) {
                selected.value = aft[0];
            }
        });

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
