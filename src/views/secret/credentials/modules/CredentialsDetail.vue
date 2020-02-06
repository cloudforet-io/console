<template>
    <div>
        <!--        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">-->
        <!--            <template #def-created_at-format="data">-->
        <!--                {{ timestampFormatter(data.value) }}-->
        <!--            </template>-->
        <!--            <template #def-credential_group_id-format="{item}">-->
        <!--                <div>-->
        <!--                    <PBadge v-for="(label, idx) in item.credential_groups" :key="idx" class="p-label"-->
        <!--                            :style-type="'gray2'"-->
        <!--                    >-->
        <!--                        {{ getEmptyString(label.name) }}-->
        <!--                    </PBadge>-->
        <!--                </div>-->
        <!--            </template>-->
        <!--        </p-info-panel>-->
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
import credentialsEventBus from '@/views/secret/credentials/CredentialsEventBus';

export default {
    name: 'PCredentialsDetail',
    components: {
        PDictPanel, PDynamicView,
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
        const baseDataSource = [
            { name: 'ID', key: 'credential_id' },
            { name: 'name', key: 'name' },
            { name: 'issue_type', key: 'issue_type' },
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                    display_format: 'YYYY-MM-DD HH:MM:SS z',
                },
            },
            {
                name: 'Group',
                key: 'credential_groups',
                view_type: 'list',
                view_option: {
                    sub_key: 'name',
                    delimiter: ' ',
                    item: {
                        view_type: 'badge',
                        view_option: {
                            text_color: '#222532',
                            background_color: '#DCDDE2',
                        },
                    },
                },
            },
        ];

        // const baseDefs = makeTrItems([
        //     ['credential_id', 'COMMON.ID', { copyFlag: true }],
        //     ['name', 'COMMON.NAME', { copyFlag: true }],
        //     ['issue_type', 'COMMON.ISSUE_TYPE', { copyFlag: true }],
        //     ['created_at', 'COMMON.CREAT', { copyFlag: true }],
        //     ['credential_group_id', 'COMMON.GROUP', { full: true }],
        // ], parent, {});
        const tags = ref({ ...props.tags });
        watch(() => props.item, (value) => {
            tags.value = _.isEmpty(value) ? {} : value.tags;
        });
        const dictPanel = ref(null);
        const resetTag = () => {
            dictPanel.value.reset();
        };
        // const getEmptyString = object => (_.isEmpty(object) ? '' : object);
        mountBusEvent(credentialsEventBus, props.tagResetEvent, resetTag);
        return {
            baseDataSource,
            tags,
            dictPanel,
            confirm(...event) {
                credentialsEventBus.$emit(props.tagConfirmEvent, props.item.credential_id, ...event);
            },
        };
    },
};
</script>

<!--<style lang="scss" scoped>-->
<!--    .p-label {-->
<!--        left-margin: 0.5rem;-->
<!--        margin-bottom:5px;-->
<!--        margin-right: 0.5rem;-->
<!--        color:$dark;-->
<!--    }-->
<!--</style>-->
