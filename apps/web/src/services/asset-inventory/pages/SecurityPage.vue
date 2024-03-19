<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PHeading, PDivider, PEmpty } from '@spaceone/design-system';

import CloudServiceDetailPage
    from '@/services/asset-inventory/pages/CloudServiceDetailPage.vue';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';

const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;

const storeState = reactive({
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
    selectedCloudServiceType: computed(() => securityPageGetters.selectedCloudServiceType),
});
</script>

<template>
    <cloud-service-detail-page v-if="securityPageGetters.loading || storeState.cloudServiceTypeList.length > 0"
                               :is-security-page="true"
                               :provider="storeState.selectedCloudServiceType?.data.provider"
                               :group="storeState.selectedCloudServiceType?.data.group"
                               :name="storeState.selectedCloudServiceType?.name"
    />
    <div v-else>
        <p-heading :title="$t('INVENTORY.SECURITY.MAIN.TITLE')"
                   use-total-count
                   :total-count="0"
        />
        <p-divider />
        <p-empty show-image
                 image-size="md"
                 class="no-data"
        >
            <template #image>
                <img src="@/assets/images/illust_microscope.svg"
                     alt="empty-image"
                >
            </template>
            {{ $t('COMMON.ERROR.NO_RESOURCE_TITLE') }}
        </p-empty>
    </div>
</template>

<style lang="postcss" scoped>
.no-data {
    margin-top: 4.25rem;
}
</style>
