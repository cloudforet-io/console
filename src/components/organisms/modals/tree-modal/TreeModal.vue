<template>
    <p-button-modal
        class="p-tree-modal"
        :header-title="headerTitle"
        :scrollable="false"
        :centered="true"
        :size="size"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :theme-color="themeColor"
        :footer-cancel-button-bind="footerCancelButtonBind"
        :footer-confirm-button-bind="footerConfirmButtonBind"

        @cancel="cancel"
        @close="close"
        @confirm="confirm"
    >
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
        </template>
        <template #body>
            <div class="p-tree-modal-block">
                <p-tree ref="p-tree" :data="data" :options="options"
                        :loading="loading"
                        :icons="icons" :select-mode="true"
                        v-on="$listeners"
                />
            </div>
            <slot name="default" />
        </template>
    </p-button-modal>
</template>
<script>
import { reactive, computed, ref } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import {
    makeByPass, makeProxy,
} from '@/lib/compostion-util';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import { treeProps } from '@/components/molecules/tree-new/ToolSet';
import { sizeMapping } from '@/components/molecules/modals/toolset';

const setup = (props, context) => {
    const state = contentModalSetup(props, context);
    const footerCancelButtonBind = reactive({
        styleType: 'dark',
        outline: true,
    });
    const footerConfirmButtonBind = computed(() => ({
        styleType: props.themeColor === 'primary' ? 'primary-dark' : props.themeColor,
    }));


    return {
        ...state,
        'p-tree': ref(null),
        footerCancelButtonBind,
        footerConfirmButtonBind,
        proxyVisible: makeProxy('visible'),
        cancel: makeByPass(context.emit, 'cancel'),
        close: makeByPass(context.emit, 'close'),
        confirm: makeByPass(context.emit, 'confirm'),
    };
};

export default {
    name: 'PTreeModal',
    components: {
        PButtonModal, PTree,
    },
    props: {
        size: {
            type: String,
            default: 'md',
            validator: value => value in sizeMapping,
        },
        visible: { // sync
            type: Boolean,
            default: false,
        },
        themeColor: {
            type: String,
            default: 'primary',
        },
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
        headerTitle: {
            type: String,
            default: 'Tree Modal',
        },
        data: treeProps.data,
        options: treeProps.options,
        icons: treeProps.icons,
        loading: treeProps.loading,
    },
    setup(props, context) {
        return setup(props, context);
    },
};
</script>

<style lang="postcss" scoped>
    .p-tree-modal-block{
        @apply bg-primary4 border border-gray2 rounded-sm overflow-auto h-auto;
        max-height: 50vh;
    }

</style>
