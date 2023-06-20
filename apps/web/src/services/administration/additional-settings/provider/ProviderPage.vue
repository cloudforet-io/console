<script lang="ts" setup>
import { PHeading, PDivider } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

// import { useManagePermissionState } from '@/common/composables/page-manage-permission';
// import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const { t } = useI18n();
//
// const state = reactive({
//     hasManagePermission: useManagePermissionState(),
// });
//
// const { hasManagePermission } = toRefs(state);

</script>

<template>
    <section class="provider-page">
        <!--TODO: translation-->
        <p-heading :title="t('Provider')" />
        <p-divider />
        <p>Hi Provider</p>
    </section>
</template>
