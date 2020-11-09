<template>
    <div>
        <p-info-panel :info-title="$t('IDENTITY.USER.BASE_INFORMATION')" :defs="baseDefs" :item="item">
            <template #def-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)" />
            </template>
        </p-info-panel>
    </div>
</template>

<script lang="ts">
import { ComponentRenderProxy, computed, getCurrentInstance } from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/PInfoPanel.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { timestampFormatter, arrayFormatter, userStateFormatter } from '@/lib/util';

export default {
    name: 'PUserDetail',
    components: {
        PInfoPanel, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },

    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const baseDefs = computed(() => ([
            { name: 'user_id', label: vm.$t('IDENTITY.USER.USER_ID') },
            { name: 'name', label: vm.$t('IDENTITY.USER.NAME') },
            { name: 'email', label: vm.$t('IDENTITY.USER.EMAIL') },
            { name: 'state', label: vm.$t('IDENTITY.USER.STATE') },
            { name: 'mobile', label: vm.$t('IDENTITY.USER.MOBILE') },
            { name: 'group', label: vm.$t('IDENTITY.USER.GROUP') },
            { name: 'language', label: vm.$t('IDENTITY.USER.LANGUAGE') },
            { name: 'domain_id', label: vm.$t('IDENTITY.USER.DOMAIN_ID') },
            { name: 'timezone', label: vm.$t('IDENTITY.USER.TIMEZONE') },
        ]));

        return {
            baseDefs,
            userStateFormatter,
            timestampFormatter,
            arrayFormatter,
        };
    },
};
</script>
