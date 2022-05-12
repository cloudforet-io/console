<template>
    <!--    song-lang-->
    <delete-modal
        :visible.sync="proxyVisible"
        :header-title="attachedRoles ? 'Cannot delete this policy' : 'Are you sure you want to delete this?'"
        :only-show-footer-close-button="attachedRoles"
    >
        <template v-if="attachedRoles" #delete-modal-body>
            <div class="modal-delete-disabled-title">
                <!--                song-lang-->
                <span>Please note that this policy is currently </span>
                <!--                song-lang-->
                <p-anchor :to="{name: '#'}" size="lg" highlight>
                    attached in following roles.
                </p-anchor>
            </div>
            <p-data-table :fields="fields" />
        </template>
    </delete-modal>
</template>

<script lang="ts">
import { PAnchor, PDataTable } from '@spaceone/design-system';
import { useProxyValue } from '@/common/composables/proxy-state';
import { reactive, toRefs } from '@vue/composition-api';
import deleteModal from '@/common/components/modals/DeleteModal.vue';

export default {
    name: 'PolicyDeleteModal',
    components: {
        deleteModal,
        PAnchor,
        PDataTable,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        attachedRoles: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            fields: [
                // song-lang
                { name: 'Name', key: 'name' },
                { name: 'Description', key: 'tags' },
                { name: 'Type', key: 'type' },
            ],
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.modal-delete-disabled-title {
    @apply inline-block;
}
</style>
