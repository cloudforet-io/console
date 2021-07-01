<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="false"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    :disabled="disabled"
                    theme-color="alert"
                    @confirm="$emit('confirm')"
    >
        <template #body>
            <p class="delete-modal-content">
                <slot>{{ contents }}</slot>
            </p>
        </template>
        <template v-if="confirmText" #confirm-button>
            {{ confirmText }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/core-lib/compostion-util';

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
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.delete-modal-content {
    line-height: 160%;
}
</style>
