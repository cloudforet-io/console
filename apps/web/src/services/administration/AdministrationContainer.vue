<template>
    <fragment>
        <general-page-layout>
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
    </fragment>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, defineComponent,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import RoleCreateEditHandbook from '@/services/administration/components/RoleCreateEditHandbook.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';


export default defineComponent({
    name: 'AdministrationContainer',
    components: {
        GeneralPageLayout,
        HandbookButton,
        RoleCreateEditHandbook,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const { breadcrumbs } = useBreadcrumbs();
        const handbookState = reactive({
            isVisible: computed((): boolean => (vm?.$route.name === makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME)
                    || vm?.$route.name === makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME))),
        });
        return {
            breadcrumbs,
            handbookState,
        };
    },
});
</script>
