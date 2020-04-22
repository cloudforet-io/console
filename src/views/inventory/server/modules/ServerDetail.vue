<template>
    <div>
        <p-panel-top>
            Base Information
        </p-panel-top>
        <p-dynamic-view view_type="item" :data="item||{}"
                        :data_source="dataSource" :root-mode="true"
                        class="mb-6"
        />
        <p-dynamic-details :details="item.metadata.details" :data="item||{}" />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';

export default {
    name: 'PServerDetail',
    components: {
        PDynamicView, PDynamicDetails, PPanelTop,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        dataSource: {
            type: Array,
            default: () => [],
        },
    },
};
</script>
