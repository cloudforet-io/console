<template>
    <p-button-modal class="delete-modal"
                    :header-title="headerTitle"
                    :size="size"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    :disabled="disabled"
                    :hide-footer="hideFooter"
                    theme-color="alert"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="$emit('close')"
                    @cancel="$emit('cancel')"
    >
        <template #body>
            <p
                v-if="contents || $scopedSlots.default"
                :class="{'delete-modal-content': true, 'enable-scroll': enableScroll}"
            >
                <slot>{{ contents }}</slot>
            </p>
            <slot name="delete-modal-body" />
            <div class="content-footer">
                <p-button v-if="hideFooter"
                          class="close-button"
                          style-type="tertiary"
                          @click="handleClose"
                >
                    {{ $t('APP.MAIN.CLOSE') }}
                </p-button>
            </div>
        </template>
        <template v-if="confirmText"
                  #confirm-button
        >
            {{ confirmText }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import { reactive, toRefs } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButtonModal, PButton } from '@spaceone/design-system';

import type { Size } from '@/common/components/modals/config';
import { SIZE } from '@/common/components/modals/config';
import { useProxyValue } from '@/common/composables/proxy-state';

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
            type: String as PropType<TranslateResult>,
            default: '',
        },
        contents: {
            type: String as PropType<TranslateResult>,
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
        enableScroll: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
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
    line-height: 160%;
}
.content-footer {
    text-align: right;
    .close-button {
        @apply mt-6;
    }
}
.enable-scroll {
    overflow-y: scroll;
    max-height: 43.75rem;
}
</style>
