<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)" />
            </template>
        </p-info-panel>

        <p-dict-panel ref="dictPanel" :dict.sync="tags" @confirm="confirm" />
    </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel_origin.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import { timestampFormatter, arrayFormatter, userStateFormatter } from '@/lib/util';
import { mountBusEvent } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/view-helper';
import userEventBus from '@/views/identity/user/UserEventBus';

export default {
    name: 'PUserDetail',
    components: {
        PInfoPanel, PDictPanel, PStatus,
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
            if (value) {
                tags.value = value.tags || {};
            }
        });
        const dictPanel = ref(null);
        const resetTag = () => {
            dictPanel.value.reset();
        };
        mountBusEvent(userEventBus, props.tagResetEvent, resetTag);
        return {
            baseDefs,
            tags,
            dictPanel,
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
