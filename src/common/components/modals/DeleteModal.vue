<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="false"
                    :size="size"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    :disabled="disabled"
                    :hide-footer-close-button="onlyShowFooterCloseButton"
                    :theme-color="onlyShowFooterCloseButton? 'gray-border': 'alert'"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p v-if="contents || $scopedSlots.default" class="delete-modal-content">
                <slot>{{ contents }}</slot>
            </p>
            <slot name="delete-modal-body" />
        </template>
        <template v-if="confirmText" #confirm-button>
            {{ confirmText }}
        </template>
        <template v-if="onlyShowFooterCloseButton" #confirm-button>
            close
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { useProxyValue } from '@/common/composables/proxy-state';
import { SIZE, Size } from '@/common/components/modals/config';

export default {
    name: 'DeleteModal',
    components: {
        PButtonModal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: '',
        },
        contents: {
            type: String,
            default: '',
        },
        confirmText: {
            type: String,
            default: '',
        },
        size: {
            type: String,
            validator(value: Size): boolean {
                return Object.values(SIZE).includes(value);
            },
            default: SIZE.sm,
        },
        onlyShowFooterCloseButton: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
        });
        const handleConfirm = () => {
            if (props.onlyShowFooterCloseButton) {
                state.proxyVisible = false;
            } else emit('confirm');
        };
        return {
            ...toRefs(state),
            handleConfirm,
            SIZE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.delete-modal-content {
    line-height: 160%;
}
</style>
