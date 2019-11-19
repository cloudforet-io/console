<template>
    <div class="animated fadeIn">
        <p-button-modal
            ref="modal"
            :scrollable="true"
            :centered="true"
            :size="'xl'"
            :fade="true"
            :backdrop="true"
            :header-title="getMemberModalTitle"
            :visible.sync="visible"
            @close="close"
            @confirm="confirm"
        >
            <template #body>
                <p>what the fuck</p>
            </template>
        </p-button-modal>
    </div>
</template>
<script>

import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';

export default {
    name: 'ProjectMember',
    events: ['close'],
    components: {
        PButtonModal,
    },
    data() {
        return {
            visible: false,
        };
    },
    computed: {
        getMemberModalTitle() {
            return this.tr('IDENTITY.ADD_ARG', [this.tr('COMMON.MEMBER')]);
        },
    },
    mounted() {

    },

    methods: {
        showModal() {
            this.visible = true;
        },
        hideModal() {
            this.visible = false;
        },
        confirm() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
    },
};
</script>
<style lang="scss" scoped>
</style>
