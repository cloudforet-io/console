<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="routeState.route" />
        </div>
        <server-main />
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive,
} from '@vue/composition-api';

import { PPageNavigation } from '@spaceone/design-system';

import ServerMain from '@/views/inventory/server/modules/ServerMain.vue';
import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
import { store } from '@/store';


export default {
    name: 'Server',
    components: {
        ServerMain,
        GeneralPageLayout,
        PPageNavigation,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.INVENTORY.INVENTORY'), path: '/inventory' },
                { name: vm.$t('MENU.INVENTORY.SERVER'), path: '/inventory/server' },
            ]),
        });
        (async () => {
            await store.dispatch('resource/loadAll');
        })();
        return {
            routeState,
        };
    },
};

</script>
