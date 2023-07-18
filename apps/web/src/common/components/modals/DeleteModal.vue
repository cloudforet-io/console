<template>
    <p-button-modal v-model:visible="state.proxyVisible"
                    class="delete-modal"
                    :header-title="headerTitle"
                    :size="size"
                    :fade="true"
                    :backdrop="true"
                    :disabled="disabled"
                    :hide-footer="hideFooter"
                    theme-color="alert"
                    :loading="loading"
                    @confirm="handleConfirm"
                    @close="handleClose"
                    @cancel="handleCancel"
    >
        <template #body>
            <p
                v-if="contents || slots.default"
                :class="{'delete-modal-content': true, 'enable-scroll': enableScroll}"
            >
                <slot>{{ contents }}</slot>
            </p>
            <slot name="delete-modal-body" />
            <div class="content-footer">
                <p-button v-if="hideFooter"
                          class="close-button"
                          style-type="tertiary"
                          @click="handleClickClose"
                >
                    {{ t('APP.MAIN.CLOSE') }}
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

<script lang="ts" setup>
import { PButtonModal, PButton } from '@spaceone/design-system';
import { reactive, useSlots } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Size } from '@/common/components/modals/config';
import { SIZE } from '@/common/components/modals/config';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    visible: boolean;
    disabled: boolean;
    headerTitle: string;
    contents: string;
    confirmText: string;
    loading: boolean;
    size: Size;
    hideFooter: boolean;
    enableScroll: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    disabled: false,
    headerTitle: '',
    contents: '',
    confirmText: '',
    loading: false,
    size: SIZE.sm,
    hideFooter: false,
    enableScroll: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
    (e: 'close'): void;
    (e: 'cancel'): void;
}>();
const { t } = useI18n();
const slots = useSlots();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});
const handleConfirm = () => {
    if (props.hideFooter) {
        state.proxyVisible = false;
    } else emit('confirm');
};
const handleClickClose = () => { state.proxyVisible = false; };
const handleClose = () => { emit('close'); };
const handleCancel = () => { emit('cancel'); };

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
