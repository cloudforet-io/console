<template>
    <div>
        <p-info-panel info-title="Base Information" :defs="baseDefs" :item="item">
            <template #def-name-format="data">
                <span class="name">
                    <p-i name="aws-ec2" class="icon" />
                    {{ data.value }}
                </span>
            </template>
            <template #def-state-format="data">
                <p-status v-bind="collectorStateFormatter(data.value)" />
            </template>
            <template #def-plugin_info-format="data">
                <ul v-if="data.value.options && data.value.options.supported_resource_type">
                    <li v-for="(d, i) in data.value.options.supported_resource_type" :key="i">
                        {{ d }}
                    </li>
                </ul>
                <span v-else />
            </template>
            <template #def-default_collect_state-format="data">
                <span>ALL</span>
            </template>
            <template #def-last_collected_at-format="data">
                {{ data.value ? timestampFormatter(data.value) : '' }}
            </template>
            <template #def-created_at-format="data">
                {{ timestampFormatter(data.value) }}
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
import PI from '@/components/atoms/icons/PI';
import { timestampFormatter, collectorStateFormatter } from '@/lib/util';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { makeTrItems } from '@/lib/helper';

export default {
    name: 'PServerDetail',
    components: {
        PI, PInfoPanel, PTagPanel, PBadge, PStatus,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
    },
    setup(props, { parent }) {
        const baseDefs = makeTrItems([
            ['collector_id', 'COMMON.ID'],
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['priority', 'COMMON.PRIORITY'],
            ['plugin_info', 'COMMON.RESOURCE'],
            ['default_collect_state', 'COMMON.DEF_COL_STATE'],
            ['last_collected_at', 'COMMON.LAST_COL'],
            ['created_at', 'COMMON.CREATED'],
        ], parent, { copyFlag: true });
        const tags = ref({ ...props.item.tags });
        watch(() => props.item, (value) => {
            tags.value = value.tags;
        });
        const tagPanel = ref(null);
        const resetTag = () => {
            tagPanel.value.resetTag();
        };
        mountBusEvent(collectorEventBus, 'resetTags', resetTag);

        return {
            baseDefs,
            tags,
            tagPanel,
            confirm(...event) {
                collectorEventBus.$emit('confirmTags', props.item.collector_id, ...event);
            },
            timestampFormatter,
            collectorStateFormatter,
            //   serverStateFormatter,
            //   arrayFormatter,
            // platformBadgeFormatter,
        };
    },
};
</script>

<style lang="scss" scoped>

    .name {
        .icon {
            margin-right: 1rem;
        }
    }

</style>
