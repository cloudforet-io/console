<template>
    <p-button-modal :header-title="editMode ?
                        $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.UPDATE_TITLE')
                        : $t('PROJECT.DETAIL.MAINTENANCE_WINDOW.FORM.CREATE_TITLE')"
                    :visible.sync="proxyVisible"
    >
        <template #body />
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal } from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';

export default {
    name: 'MaintenanceWindowFormModal',
    components: {
        PButtonModal,
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        editMode: {
            type: Boolean,
            default: false,
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

</style>
