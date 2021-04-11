<template>
    <p-button-modal :visible.sync="visibleCheckModal" size="md"
                    :header-title="$t('AUTOMATION.SPOT_AUTOMATION.ADD.CHECK_MODAL.TITLE')"
                    theme-color="primary-dark"
                    @confirm="$emit('confirm')"
    >
        <template #close-button>
            {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CHECK_MODAL.BACK') }}
        </template>
        <template #body>
            <table class="check-table">
                <tbody>
                    <tr v-if="!editMode">
                        <td>{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CHECK_MODAL.CLOUD_SERVICE_CATEGORY_LABEL') }}</td>
                        <td>
                            {{ category }}
                        </td>
                    </tr>
                    <tr v-if="!editMode">
                        <td>{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CHECK_MODAL.RESOURCE_NAME_LABEL') }}</td>
                        <td>
                            {{ selectedResource.data.auto_scaling_group_name }}
                        </td>
                    </tr>
                    <tr v-if="!editMode">
                        <td>{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CHECK_MODAL.SPOT_GROUP_LABEL') }}</td>
                        <td>
                            {{ name }}
                        </td>
                    </tr>
                    <tr>
                        <td>{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.LABEL') }}</td>
                        <td>
                            <p class="text-secondary">
                                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_ONDEMAND') }}&nbsp;
                                <strong>{{ onDemand }}{{ unit }}</strong>
                            </p>
                            <p class="text-peacock-500">
                                {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.SETTING_SPOT_INSTANCE') }}&nbsp;
                                <strong>{{ spotInstance }}{{ unit }}</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td>{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.INSTANCE_TYPE.LABEL') }}</td>
                        <td>
                            <p-text-list :items="recommendTypes" delimiter=", " />
                        </td>
                    </tr>
                </tbody>
            </table>
            <p class="info">
                <p-i name="ic_outlined-info" color="inherit" height="1em"
                     width="1em"
                />
                <span class="desc">{{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.CHECK_MODAL.DESC') }}</span>
            </p>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PI, PTextList } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import { SETTINGS_TYPE } from '@/views/automation/spot-automation/lib/config';

interface Props {
    visible: boolean;
    category: string;
    selectedResource: any|null;
    name: string;
    recommendTypes: string[];
    onDemand: number;
    spotInstance: number;
    onDemandType: SETTINGS_TYPE;
    editMode: boolean;
}

export default {
    name: 'SpotGroupCheckModal',
    components: {
        PButtonModal,
        PI,
        PTextList,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            default: '',
        },
        selectedResource: {
            type: Object,
            default: null,
        },
        name: {
            type: String,
            default: '',
        },
        recommendTypes: {
            type: Array,
            default: () => [],
        },
        onDemand: {
            type: Number,
            default: 0,
        },
        spotInstance: {
            type: Number,
            default: 0,
        },
        onDemandType: {
            type: String,
            default: SETTINGS_TYPE.count,
        },
        editMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            visibleCheckModal: makeProxy('visible', props, emit),
            unit: computed(() => (props.onDemandType === SETTINGS_TYPE.count ? vm.$t('AUTOMATION.SPOT_AUTOMATION.ADD.SCHEDULE_POLICY.UNIT_COUNT') : '%')),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.check-table {
    margin-top: 0.5rem;
    width: 100%;
    tr {
        @apply border-b border-gray-300;
    }
    td {
        @apply text-gray-900;
        font-size: 0.875rem;
        line-height: 1.7;
        padding: 0.53125rem 1rem 0.46875rem;
        &:first-child {
            font-weight: bold;
        }
    }
}
.info {
    @apply text-peacock-500;
    margin-top: 1rem;
    font-size: 0.875rem;
    vertical-align: middle;
    .desc {
        margin-left: 0.375rem;
        line-height: 1.5;
    }
}
</style>
