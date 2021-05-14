<template>
    <p-icon-modal :visible.sync="proxyVisible"
                  icon-name="ic_done"
                  size="md"
                  :header-title="'API Key successfully created!'"
                  :button-text="'Confirm'"
                  @clickButton="onClickConfirm"
    >
        <template #body>
            test
        </template>
    </p-icon-modal>
</template>

<script lang="ts">
import { PIconModal } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'UserAPIKeyModal',
    components: {
        PIconModal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
        });

        const onClickConfirm = () => {
            context.emit('clickButton');
        };
        return {
            ...toRefs(state),
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
