<template>
    <section class="provider-page">
        <!--song-lang-->
        <p-page-title
            :title="$t('Provider')"
        />
        <p-divider />
        <p>Hi Provider</p>
    </section>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from 'vue';

import { PPageTitle, PDivider } from '@spaceone/design-system';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

export default {
    name: 'ProviderPage',
    components: {
        PPageTitle,
        PDivider,
    },
    setup() {
        const state = reactive({
            hasManagePermission: useManagePermissionState(),
        });

        return {
            ...toRefs(state),
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>
