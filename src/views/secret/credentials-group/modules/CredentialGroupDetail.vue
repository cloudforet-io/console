<template>
    <div>
        <p-divider-header>Base Information</p-divider-header>
        <p-dynamic-view name="Base Information" view_type="item" :data="item||{}"
                        :data_source="baseDataSource" :root-mode="true"
        />
        <p-dict-panel ref="dictPanel" :dict.sync="tags" @confirm="confirm" />
    </div>
</template>

<script>
/* eslint-disable camelcase */
import { ref, watch } from '@vue/composition-api';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDividerHeader from '@/components/molecules/divider-header/DividerHeader.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';

export default {
    name: 'PCdgDetail',
    components: {
        PDictPanel, PDynamicView, PDividerHeader,
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
