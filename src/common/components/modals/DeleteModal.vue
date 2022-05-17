<template>
    <p-button-modal class="delete-modal" :header-title="headerTitle"
                    :scrollable="false"
                    :size="size"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    :disabled="disabled"
                    :hide-footer="hideFooter"
                    theme-color="alert"
                    :loading="loading"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p v-if="contents || $scopedSlots.default" class="delete-modal-content">
                <slot>{{ contents }}</slot>
            </p>
            <slot name="delete-modal-body" />
            <div class="content-footer">
                <p-button v-if="hideFooter"
                          class="close-button"
                          style-type="gray-border"
                          @click="handleClose"
                >
                    {{ $t('APP.MAIN.CLOSE') }}
                </p-button>
            </div>
        </template>
        <template v-if="confirmText" #confirm-button>
            {{ confirmText }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PButton } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { useProxyValue } from '@/common/composables/proxy-state';
import { SIZE, Size } from '@/common/components/modals/config';

export default {
    name: 'DeleteModal',
    components: {
        PButtonModal,
        PButton,
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
        loading: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            validator(value: Size): boolean {
                return Object.values(SIZE).includes(value);
            },
            default: SIZE.sm,
        },
        hideFooter: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
        });
        const handleConfirm = () => {
            if (props.hideFooter) {
                state.proxyVisible = false;
            } else emit('confirm');
        };
        const handleClose = () => { state.proxyVisible = false; };
        return {
            ...toRefs(state),
            handleConfirm,
            handleClose,
            SIZE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.delete-modal-content {
    max-height: 43.75rem;
    overflow-y: scroll;
    line-height: 160%;
}
.content-footer {
    text-align: right;
    .close-button {
        @apply mt-6;
    }
}
</style>
