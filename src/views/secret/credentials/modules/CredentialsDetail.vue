<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-created_at-format="data">
                {{ timestampFormatter(data.value) }}
            </template>
            <template #def-credential_group_id-format="{item}">
                <div>
                    <PBadge v-for="(label, idx) in item.credential_groups" :key="idx" class="p-label"
                            :style-type="'gray2'"
                    >
                        {{ getEmptyString(label.name) }}
                    </PBadge>
                </div>
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
import PBadge from '@/components/atoms/badges/Badge.vue';
import credentialsEventBus from '@/views/secret/credentials/CredentialsEventBus';

export default {
    name: 'PCredentialsDetail',
    components: {
        PInfoPanel, PDictPanel, PBadge,
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
            ['credential_id', 'COMMON.ID', { copyFlag: true }],
            ['name', 'COMMON.NAME', { copyFlag: true }],
            ['issue_type', 'COMMON.ISSUE_TYPE', { copyFlag: true }],
            ['created_at', 'COMMON.CREAT', { copyFlag: true }],
            ['credential_group_id', 'COMMON.GROUP', { full: true }],
        ], parent, {});
        const tags = ref({ ...props.tags });
        watch(() => props.item, (value) => {
            tags.value = _.isEmpty(value) ? {} : value.tags;
        });
        const dictPanel = ref(null);
        const resetTag = () => {
            dictPanel.value.reset();
        };
        const getEmptyString = object => (_.isEmpty(object) ? '' : object);
        mountBusEvent(credentialsEventBus, props.tagResetEvent, resetTag);
        return {
            baseDefs,
            tags,
            getEmptyString,
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

<style lang="scss" scoped>
    .p-label {
        left-margin: 0.5rem;
        margin-bottom:5px;
        margin-right: 0.5rem;
        color:$dark;
    }
</style>
