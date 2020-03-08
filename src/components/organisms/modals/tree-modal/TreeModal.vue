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
        <template #body>
            <div class="p-tree-modal-block">
                <p-tree :data="data" :options="options" :loading="loading"
                        :icons="icons"
                />
            </div>
        </template>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope" />
        </template>
    </p-button-modal>
</template>
<script>
import { reactive, computed,  } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import { setup as contentModalSetup } from '../content-modal/ContentModal.vue';
import {
    makeByPass, makeProxy,
} from '@/lib/compostion-util';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import { sizeMapping } from '@/components/molecules/modals/ModalMapping';

const setup = (props, context) => {
    const state = contentModalSetup(props, context);


    const footerCancelButtonBind = reactive({
        styleType: 'dark',
        outline: true,
    });
    const footerConfirmButtonBind = computed(() => ({
        styleType: props.themeColor === 'primary' ? 'primary-dark' : props.themeColor,
    }));


    const confirm = async () => {
        if (props.doubleConfirm) {
            const result = await validateAPI.allValidation();
            if (result) {
                context.emit('confirm', props.items);
            }
        } else {
            context.emit('confirm', props.items);
        }
    };

    return {
        ...state,
        footerCancelButtonBind,
        footerConfirmButtonBind,

        proxyVisible: makeProxy('visible', props, context.emit),
        cancel: makeByPass(context.emit, 'cancel'),
        close: makeByPass(context.emit, 'close'),
        confirm,
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
            default: null,
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
        data: {
            type: [Array, Object],
            default: undefined,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        icons: {
            type: Object,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, context) {
        return setup(props, context);
    },
};
</script>

<style lang="postcss" scoped>
    .p-tree-modal-block{
        @apply bg-primary4 border border-gray2 rounded-sm overflow-auto;
        height: 50vh;
    }

</style>
