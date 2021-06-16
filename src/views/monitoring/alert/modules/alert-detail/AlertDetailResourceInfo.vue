<template>
    <p-pane-layout class="alert-detail-info">
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="3"
                            :stripe="false"
                            :disable-copy="true"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PDefinitionTable, PButton, PI, PTextarea, PTextInput,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { iso8601Formatter, showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import { AlertDataModel } from '@/views/monitoring/alert/type';
import { ProjectItemResp } from '@/views/project/project/type';
import ProjectTreeModal from '@/common/modules/ProjectTreeModal.vue';
import { map } from 'lodash';

interface PropsType {
    id: string;
    alertData: AlertDataModel;
}

export default {
    name: 'AlertDetailResourceInfo',
    components: {
        PPaneLayout,
        PDefinitionTable,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
        alertData: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: PropsType, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            fields: computed(() => map(state.data, (d, k) => ({ name: k, label: k.replace(/\_/g, ' ') }))),
            data: props.alertData?.resource || {},
            loading: true,
        });

        return {
            ...toRefs(state),
        };
    },
};


</script>

<style lang="postcss" scoped>
</style>
