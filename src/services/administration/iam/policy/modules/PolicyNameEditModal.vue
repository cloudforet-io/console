<template>
    <p-button-modal
        :visible.sync="proxyVisible"
        header-title="Edit Policy Name"
    >
        <template #body>
            <!--            song-lang-->
            <p-field-group label="Name" required>
                <p-text-input />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import { useProxyValue } from '@/common/composables/proxy-state';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'PolicyNameEditModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
