<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)" />
            </template>
        </p-info-panel>
    </div>
</template>

<script>
import PInfoPanel from '@/components/organisms/panels/info-panel/PInfoPanel.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { timestampFormatter, arrayFormatter, userStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';

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
    setup(props, { parent }) {
        const baseDefs = makeTrItems([
            ['user_id', 'COMMON.USER_ID'],
            ['name', 'COMMON.NAME'],
            ['email', 'COMMON.EMAIL'],
            ['state', 'COMMON.STATE'],
            ['mobile', 'COMMON.PHONE', { sortable: false }],
            ['group', 'COMMON.GROUP'],
            ['language', 'COMMON.LANGUAGE'],
            ['domain_id', 'COMMON.DOMAIN_ID'],
            ['timezone', 'COMMON.TIMEZONE'],
        ], parent, { copyFlag: true });


        return {
            baseDefs,
            userStateFormatter,
            timestampFormatter,
            arrayFormatter,
        };
    },
};
</script>
