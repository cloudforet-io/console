<template>
    <div class="animated fadeIn">
        <!-- <p-content-modal
            ref="modal"
            :scrollable="true"
            :centered="true"
            size="xl">
            <template #header>
                <h3>This is Header</h3>
            </template>
            <template #body>
                <p>8181818181818</p>
            </template>
            <template #footer />
        </p-content-modal>-->

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

        };
    },
    computed: {

    },
    mounted() {

    },
    methods: {
        showModal() {
            this.$refs.modal.show();
        },
        hideModal() {
            this.$refs.modal.hide();
        },
    },
};
</script>
<style lang="scss" scoped>
</style>
