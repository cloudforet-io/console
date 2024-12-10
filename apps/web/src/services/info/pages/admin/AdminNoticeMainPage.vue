<template>
    <div class="notice-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('INFO.NOTICE.MAIN.NOTICE_TITLE')" />
            </template>
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <p-button v-if="storeState.hasDomainRoleUser"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateNotice"
                >
                    {{ $t('INFO.NOTICE.FORM.CREATE_NOTICE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <notice-list />
    </div>
</template>

<script lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useUserStore } from '@/store/user/user-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import NoticeList from '@/services/info/components/NoticeList.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';

export default {
    name: 'AdminNoticeMainPage',
    components: {
        PHeading,
        PButton,
        NoticeList,
        PHeadingLayout,
    },
    setup() {
        const router = useRouter();

        const userStore = useUserStore();

        const storeState = reactive({
            hasDomainRoleUser: computed(() => userStore.getters.isDomainAdmin),
        });
        const state = reactive({
            hasReadWriteAccess: computed<boolean|undefined>(() => usePageEditableStatus()),
        });
        const handleCreateNotice = () => {
            router.push({ name: makeAdminRouteName(INFO_ROUTE.NOTICE.CREATE._NAME) });
        };

        return {
            storeState,
            state,
            handleCreateNotice,
        };
    },
};
</script>


