<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-created_at-format="data">
                {{ timestampFormatter(data.value) }}
            </template>
        </p-info-panel>

        <p-dict-panel ref="dictPanel" :dict.sync="tags" @confirm="confirm" />
    </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import { timestampFormatter, arrayFormatter } from '@/lib/util';
import { mountBusEvent } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/view-helper';
import credentialsEventBus from '@/views/secret/credentials/CredentialsEventBus';

export default {
    name: 'PUserDetail',
    components: {
        PInfoPanel, PDictPanel
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
            ['credential_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['issue_type', 'COMMON.ISSUE_TYPE'],
            ['created_at', 'COMMON.CREAT'],
        ], parent, { copyFlag: true });
        const tags = ref({ ...props.tags });
        watch(() => props.item, (value) => {
            tags.value = value.tags || {};
        });
        const dictPanel = ref(null);
        const resetTag = () => {
            dictPanel.value.reset();
        };
        mountBusEvent(credentialsEventBus, props.tagResetEvent, resetTag);
        return {
            baseDefs,
            tags,
            dictPanel,
            confirm(...event) {
                credentialsEventBus.$emit(props.tagConfirmEvent, props.item.credential_id, ...event);
            },
            timestampFormatter,
            arrayFormatter,
        };
    },
};
</script>
