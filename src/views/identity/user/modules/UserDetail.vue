<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)" />
            </template>
        </p-info-panel>

        <p-tag-panel ref="tagPanel" :tags.sync="tags" @confirm="confirm" />
    </div>
</template>

<script>
import {
    computed, ref, watch,
} from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel';
import PTagPanel from '@/components/organisms/panels/tag-panel/TagPanel';
import PBadge from '@/components/atoms/badges/Badge';
import PStatus from '@/components/molecules/status/Status';
import { timestampFormatter, arrayFormatter, userStateFormatter } from '@/lib/util';
import { mountBusEvent } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/helper';
import userEventBus from '@/views/identity/user/UserEventBus';

export default {
    name: 'PUserDetail',
    components: {
        PInfoPanel, PTagPanel, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        // todo: need confirm that this is good way - sinsky
        tagConfirmEvent: String,
        tagResetEvent: String,
    },
    setup(props, { parent }) {
        const baseDefs = makeTrItems([
            ['user_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['email', 'COMMON.EMAIL'],
            ['state', 'COMMON.STATE'],
            ['mobile', 'COMMON.PHONE', { sortable: false }],
            ['group', 'COMMON.GROUP'],
            ['language', 'COMMON.LANGUAGE'],
            ['domain_id', 'COMMON.DOMAIN_ID'],
            ['timezone', 'COMMON.TIMEZONE'],
        ], parent, { copyFlag: true });
        const tags = ref({ ...props.tags });
        watch(() => props.item, (value) => {
            tags.value = value.tags;
        });
        const tagPanel = ref(null);
        const resetTag = () => {
            tagPanel.value.resetTag();
        };
        mountBusEvent(userEventBus, props.tagResetEvent, resetTag);

        return {
            baseDefs,
            tags,
            tagPanel,
            confirm(...event) {
                userEventBus.$emit(props.tagConfirmEvent, props.item.user_id, ...event);
            },
            userStateFormatter,
            timestampFormatter,
            arrayFormatter,
        };
    },
};
</script>
