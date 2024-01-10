<template>
    <div class="notice-page">
        <p-heading :title="$t('INFO.NOTICE.MAIN.NOTICE_TITLE')">
            <template #extra>
                <p-button v-if="hasDomainRoleUser"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateNotice"
                >
                    {{ $t('INFO.NOTICE.FORM.CREATE_NOTICE') }}
                </p-button>
            </template>
        </p-heading>
        <notice-list />
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading,
} from '@spaceone/design-system';

import { store } from '@/store';


import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import NoticeList from '@/services/info/components/NoticeList.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';

export default {
    name: 'AdminNoticeMainPage',
    components: {
        PHeading,
        PButton,
        NoticeList,
    },
    setup() {
        const { getProperRouteLocation } = useProperRouteLocation();
        const router = useRouter();
        const state = reactive({
            hasDomainRoleUser: computed(() => store.getters['user/isDomainAdmin']),
        });
        const handleCreateNotice = () => {
            router.push(getProperRouteLocation({ name: INFO_ROUTE.NOTICE.CREATE._NAME }));
        };

        return {
            ...toRefs(state),
            handleCreateNotice,
        };
    },
};
</script>


