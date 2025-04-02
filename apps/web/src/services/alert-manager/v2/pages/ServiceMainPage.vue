<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import ServiceList from '@/services/alert-manager/v2/components/ServiceList.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';

const router = useRouter();

const allReferenceStore = useAllReferenceStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const handleClickCreateButton = () => {
    if (!hasReadWriteAccess) return;
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.CREATE._NAME,
    }).catch(() => {});
};

onMounted(() => {
    allReferenceStore.load('escalation_policy', { force: true });
});
</script>

<template>
    <div class="service-main-page">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="$t('MENU.ALERT_MANAGER_SERVICE')" />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleClickCreateButton"
                >
                    {{ $t('ALERT_MANAGER.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <service-list class="mt-6" />
    </div>
</template>
