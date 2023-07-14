<script lang="ts" setup>
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import UserAPIKeyHandbook from '@/services/my-page/my-account/user-api-key/modules/APIKeyHandbook.vue';
import MyPageLNB from '@/services/my-page/MyPageLNB.vue';

const route = useRoute();

const { breadcrumbs } = useBreadcrumbs();
const handbookState = reactive({
    tabs: [{ name: 'spacectl', label: 'Spacectl', keepAlive: true }] as TabItem[],
    activeTab: 'spacectl',
    isVisible: computed((): boolean => route.name === 'my_page.api_key'),
});

</script>

<template>
    <vertical-page-layout v-if="route.meta.lnbVisible"
                          :breadcrumbs="breadcrumbs"
    >
        <template #sidebar>
            <my-page-l-n-b />
        </template>
        <template v-if="handbookState.isVisible"
                  #handbook
        >
            <div class="flex">
                <handbook-button v-model:active-tab="handbookState.activeTab"
                                 :tabs="handbookState.tabs"
                                 type="identity/user/api-key"
                                 class="flex-shrink-0"
                >
                    <template #spacectl>
                        <keep-alive>
                            <user-a-p-i-key-handbook />
                        </keep-alive>
                    </template>
                </handbook-button>
            </div>
        </template>
        <router-view />
    </vertical-page-layout>
    <general-page-layout v-else
                         :breadcrumbs="breadcrumbs"
    >
        <router-view />
    </general-page-layout>
</template>
