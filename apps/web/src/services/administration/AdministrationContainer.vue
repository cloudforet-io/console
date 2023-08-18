<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import AdministrationLNB from '@/services/administration/AdministrationLNB.vue';
import RoleCreateEditHandbook from '@/services/administration/modules/RoleCreateEditHandbook.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

const route = useRoute();
const { breadcrumbs } = useBreadcrumbs();
const handbookState = reactive({
    isVisible: computed((): boolean => (route.name === ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME || route.name === ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME)),
});

</script>

<template>
    <vertical-page-layout v-if="$route.meta.lnbVisible"
                          :breadcrumbs="breadcrumbs"
    >
        <template #sidebar>
            <administration-l-n-b />
        </template>
        <router-view />
    </vertical-page-layout>
    <general-page-layout v-else
                         :breadcrumbs="breadcrumbs"
    >
        <template v-if="handbookState.isVisible"
                  #handbook
        >
            <div class="flex">
                <handbook-button type="administration/iam/role/create-edit"
                                 class="flex-shrink-0"
                >
                    <keep-alive>
                        <role-create-edit-handbook />
                    </keep-alive>
                </handbook-button>
            </div>
        </template>
        <router-view />
    </general-page-layout>
</template>
