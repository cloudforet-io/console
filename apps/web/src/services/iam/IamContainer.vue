<template>
    <fragment>
        <general-page-layout>
            <template v-if="handbookState.isVisible"
                      #handbook
            >
                <div class="handbook-button-wrapper">
                    <handbook-button type="iam/role/create-edit"
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
    </fragment>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, defineComponent,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import RoleCreateEditHandbook from '@/services/iam/components/RoleCreateEditHandbook.vue';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';


export default defineComponent({
    name: 'IamContainer',
    components: {
        GeneralPageLayout,
        HandbookButton,
        RoleCreateEditHandbook,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const handbookState = reactive({
            isVisible: computed((): boolean => (vm?.$route.name === makeAdminRouteName(IAM_ROUTE.ROLE.CREATE._NAME)
                    || vm?.$route.name === makeAdminRouteName(IAM_ROUTE.ROLE.EDIT._NAME))),
        });
        return {
            handbookState,
        };
    },
});
</script>

<style lang="postcss" scoped>
.handbook-button-wrapper {
    @apply flex justify-end;
    flex: 1;
    max-width: 116.75rem;
}
</style>
