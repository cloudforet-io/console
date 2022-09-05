<template>
    <p-pane-layout class="service-account-account-type">
        <!--song-lang-->
        <p-panel-top title="Account Type" />
        <div class="content-wrapper">
            Read, Create만 있음
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';

import {
    PPaneLayout, PPanelTop,
} from '@spaceone/design-system';

import type { PageMode } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'ServiceAccountAccountType',
    components: {
        PPaneLayout,
        PPanelTop,
    },
    props: {
        mode: {
            type: String as PropType<PageMode>,
            default: 'READ',
        },
    },
    setup() {
        return {};
    },
};
</script>
<style lang="postcss" scoped>
.service-account-account-type {
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
    }
}
</style>
