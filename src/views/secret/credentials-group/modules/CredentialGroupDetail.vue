<template>
    <div>
        <p-panel-top>Base Information</p-panel-top>
        <p-dynamic-view name="Base Information" view_type="item" :data="item||{}"
                        :data_source="baseDataSource" :root-mode="true"
        />
        <p-dict-panel ref="dictPanel" :dict.sync="tags" @confirm="confirm" />
    </div>
</template>

<script>
/* eslint-disable camelcase */
import { ref, watch } from '@vue/composition-api';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel_origin.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';

export default {
    name: 'PCdgDetail',
    components: {
        PDictPanel, PDynamicView, PPanelTop,
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
        const baseDataSource = [
            { name: 'ID', key: 'credential_group_id' },
            { name: 'Name', key: 'name' },
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
        ];

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
        mountBusEvent(cdgEventBus, props.tagResetEvent, resetTag);
        return {
            baseDataSource,
            tags,
            dictPanel,
            confirm(...event) {
                cdgEventBus.$emit(props.tagConfirmEvent, props.item.credential_group_id, ...event);
            },
        };
    },
};
</script>
