<template>
    <p-pane-layout class="alert-detail-note">
        <p-panel-top>
            {{ $t('MONITORING.ALERT.DETAIL.NOTE') }}
        </p-panel-top>
        <article class="note-wrapper">
            <p-textarea  :value="value"/>
            <p-button style-type="gray-border" size="md" class="add-btn">
                {{$t('MONITORING.ALERT.DETAIL.ADD_NOTE')}}
            </p-button>
        </article>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PButton, PPaneLayout, PPanelTop, PTextarea,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'AlertDetailNote',
    components: {
        PPaneLayout,
        PPanelTop,
        PTextarea,
        PButton,
    },
    setup() {
        const state = reactive({
            value: 'test',
        });

        return {
            ...toRefs(state),
        };
    },
};


</script>

<style lang="postcss" scoped>
.note-wrapper {
    @apply px-4 flex flex-col;
    margin-top: 1.5rem;
}
.add-btn {
    width: 6.125rem;
    margin-top: 0.5rem;
}
</style>
