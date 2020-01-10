<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-state-format="{value}">
                <p-status v-bind="cdgStateFormatter(value)" />
            </template>
        </p-info-panel>

        <p-dict-panel ref="dictPanel" :dict.sync="tags" @confirm="tagConfirmEvent" />
    </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import { timestampFormatter, arrayFormatter, cdgStateFormatter } from '@/lib/util';
import { mountBusEvent } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/view-helper';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';

export default {
    name: 'PCdgDetail',
    components: {
        PInfoPanel, PDictPanel, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        tagConfirmEvent: String,
        tagResetEvent: String,
    },
    setup(props, { parent }) {
        const baseDefs = makeTrItems([
            ['cdg_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['created_at', 'COMMON.CREATE'],
        ], parent, { copyFlag: true });
        const tags = ref({ ...props.tags });
        watch(() => props.item, (value) => {
            tags.value = value.tags || {};
        });
        const dictPanel = ref(null);
        const resetTag = () => {
            dictPanel.value.reset();
        };
        mountBusEvent(cdgEventBus, props.tagResetEvent, resetTag);
        return {
            baseDefs,
            tags,
            dictPanel,
            confirm(...event) {
                cdgEventBus.$emit(props.tagConfirmEvent, props.item.cdg_id, ...event);
            },
            cdgStateFormatter,
            timestampFormatter,
            arrayFormatter,
        };
    },
};
</script>
