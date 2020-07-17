<template>
    <div class="s-dynamic-subdata my-8">
        <transition name="fade" mode="out-in">
            <SkePSelectBtnGroup v-if="!layouts" class="skeleton mx-4" />
            <p-select-btn-group
                v-else
                class="px-4"
                :buttons="buttons" :selected.sync="selected"
            />
        </transition>
        <transition name="fade" mode="out-in">
            <div v-if="!layouts">
                <p-skeleton width="20rem" height="2rem" class="mx-4 mt-8 mb-4" />
                <p-skeleton width="100%" height="15rem" class="w-full" />
            </div>
            <SDynamicLayout
                v-else
                v-bind="selectedLayout"
                :api="api"
                :is-show="isShow"
            />
        </transition>
        <!--        <p-empty v-if="layouts&&names.length == 0" class="my-8">-->
        <!--            No data-->
        <!--        </p-empty>-->
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, defineComponent, ref, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import PButton from '@/components/atoms/buttons/Button.vue';
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
        PSelectBtnGroup, PEmpty, PButton, PPanelTop, SDynamicLayout, SkePSelectBtnGroup, PSkeleton,
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
            api: { resource: props.resourceApi },
        });


        const api = computed(() => {
            const selectId = props.selectId; // do not remove this code!! this is required for tracking props.selectId
            return {
                resource: props.resourceApi,
                getAction: (action) => {
                    if (action.setId) {
                        return action.clone().setId(selectId);
                    }
                    return action.clone();
                },
            };
        });
        const selected = ref(state.names[0]);
        const selectedLayout = computed<DLSchema>(() => state.layoutData[selected.value]);
        const buttons = computed(() => state.names.map(name => ({
            name, label: name, vbind: { styleType: 'gray900', outline: selected.value !== name },
        })));
        watch(() => state.names, _.debounce((aft, bef) => {
            if (aft && aft[0] && aft.indexOf(selected.value) === -1) {
                selected.value = aft[0];
            }
        }, 400));


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
<style lang="postcss">
    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.2s;
        .skeleton {
            transition: opacity 0s;
        }
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>
