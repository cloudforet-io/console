<template>
    <p-pane-layout class="alert-detail-info border-none">
        <p-definition-table :fields="fields" :data="data"
                            :skeleton-rows="3"
                            style-type="white"
                            :disable-copy="true"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PDefinitionTable,
} from '@spaceone/design-system';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { AlertDataModel } from '@/views/monitoring/alert-manager/type';
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
.p-definition-table::v-deep {
    .def-row {
        td {
            &:first-child {
                @apply capitalize;
            }
        }
    }
}
</style>
