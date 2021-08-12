<template>
    <p-pane-layout class="alert-detail-status-update">
        <p class="content-wrapper">
            <span class="description">{{ alertData.status_message }}</span>
            <button class="edit-btn">
                <p-i name="ic_edit" width="1rem" height="1rem"
                     color="inherit" class="edit-icon"
                />
                {{ $t('MONITORING.ALERT.DETAIL.INFO.EDIT') }}
            </button>
        </p>
    </p-pane-layout>
</template>

<script lang="ts">
import {PI, PPaneLayout} from '@spaceone/design-system';

export default {
    name: 'AlertDetailInfoStatusUpdate',
    components: {
        PPaneLayout,
        PI,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {


        return {

        };
    },
};
</script>

<style lang="postcss" scoped>
.content-wrapper {
    display: inline-flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    vertical-align: middle;
    min-height: 4.75rem;
}
</style>
