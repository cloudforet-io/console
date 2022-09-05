<template>
    <p-pane-layout class="service-account-account-type">
        <div class="title">
            <!--song-lang-->
            Account Type
        </div>
        Read, Create만 있음
    </p-pane-layout>
</template>

<script lang="ts">
import type { PropType } from '@vue/composition-api';

import {
    PPaneLayout,
} from '@spaceone/design-system';

import type { PageMode } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'ServiceAccountAccountType',
    components: {
        PPaneLayout,
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
    padding: 2rem 1rem;
    .title {
        font-size: 1.5rem;
        line-height: 120%;
        margin-bottom: 2rem;
    }
}
</style>
