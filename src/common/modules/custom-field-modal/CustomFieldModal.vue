<template>
    <p-button-modal :visible.sync="proxyVisible" :header-title="$t('COMMON.CUSTOM_FIELD_MODAL.TITLE')">
        <template #body>
            test
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';

interface Props {
    visible: boolean;
}
export default {
    name: 'CustomFieldModal',
    components: {
        PButtonModal,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });
        return { ...toRefs(state) };
    },
};
</script>

<style lang="postcss" scoped>

</style>
