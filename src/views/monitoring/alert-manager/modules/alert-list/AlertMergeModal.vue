<template>
    <p-button-modal :visible.sync="proxyVisible"
                    :header-title="$t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.TITLE')"
                    :disabled="selectAlertInvalid"
                    :loading="loading"
                    @confirm="onConfirm"
    >
        <template #body>
            <p class="desc">
                {{ $t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.SELECT_ALERT_ DESC') }}
            </p>
            <div class="contents-wrapper">
                <section>
                    <p-field-group :label="$t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.LABEL_SOURCE_ALERT')"
                                   required
                                   :invalid="selectAlertInvalid"
                                   :invalid-text="$t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.SELECT_ALERT_ DESC')"
                    >
                        <template #label-extra>
                            ({{ items.length }})
                        </template>
                        <alert-select-dropdown :items="items" :selected.sync="selected"
                                               :invalid="selectAlertInvalid"
                                               @update:selected.once="showValidation = true"
                        />
                    </p-field-group>
                </section>

                <section>
                    <table>
                        <tbody>
                            <tr>
                                <td>{{ $t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.LABEL_TITLE') }}</td>
                                <td>{{ selected.title || '' }}</td>
                            </tr>
                            <tr>
                                <td>{{ $t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.LABEL_STATE') }}</td>
                                <td>
                                    <p-badge v-if="selected.state" :style-type="alertStateBadgeStyleTypeFormatter(selected.state)">
                                        {{ capitalize(selected.state) }}
                                    </p-badge>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.LABEL_PROJECT') }}</td>
                                <td>
                                    <p-anchor v-if="selected.project_id"
                                              :to="referenceRouter(selected.project_id, { resource_type: 'identity.Project' })"
                                              highlight
                                    >
                                        {{ projects[selected.project_id] ? projects[selected.project_id].label : selected.project_id }}
                                    </p-anchor>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.LABEL_CREATED') }}</td>
                                <td v-if="selected.created_at">
                                    {{ iso8601Formatter(selected.created_at, $store.state.user.timezone) }}
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('MONITORING.ALERT.ALERT_LIST.MERGE_MODAL.LABEL_ASSIGNED') }}</td>
                                <td>{{ selected.assignee || '' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { capitalize, isEmpty } from 'lodash';
import {
    PAnchor, PBadge, PButtonModal, PFieldGroup,
} from '@spaceone/design-system';

import { makeProxy } from '@spaceone/console-core-lib';
import { i18n } from '@/translations';
import { alertStateBadgeStyleTypeFormatter } from '@/views/monitoring/alert-manager/lib/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import AlertSelectDropdown from '@/views/monitoring/alert-manager/modules/alert-list/AlertSelectDropdown.vue';

export default {
    name: 'AlertMergeModal',
    components: {
        AlertSelectDropdown,
        PButtonModal,
        PFieldGroup,
        PAnchor,
        PBadge,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        items: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            loading: false,
            projects: computed(() => store.state.resource.project.items),
            selected: {},
            showValidation: false,
            selectAlertInvalid: computed(() => state.showValidation && isEmpty(state.selected)),
        });

        const onConfirm = async () => {
            state.loading = true;
            try {
                await SpaceConnector.client.monitoring.alert.merge({
                    alerts: props.items,
                    // eslint-disable-next-line camelcase
                    merge_to: state.selected.alert_id,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_S_MERGE'), '', root);
                emit('confirm');
                state.proxyVisible = false;
            } catch (e) {
                showErrorMessage(i18n.t('MONITORING.ALERT.ALERT_LIST.ALT_E_MERGE'), e, root);
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => state.proxyVisible, (visible) => {
            if (!visible) {
                state.selected = {};
                state.showValidation = false;
            }
        });

        return {
            ...toRefs(state),
            onConfirm,
            alertStateBadgeStyleTypeFormatter,
            referenceRouter,
            iso8601Formatter,
            capitalize,
        };
    },
};
</script>

<style lang="postcss" scoped>
.contents-wrapper {
    display: flex;
    section {
        width: 100%;
        &:first-of-type {
            margin-right: 2rem;
        }
    }
}

@screen mobile {
    .contents-wrapper {
        display: block;
        overflow: auto;
        height: 100%;
    }
    section {
        max-height: none;
        &:first-of-type {
            margin-right: 0;
            margin-bottom: 2rem;
        }
    }
}

.desc {
    @apply text-gray-900;
    font-size: 1.125rem;
    line-height: 1.5;
    margin-bottom: 1.125rem;
}
tr {
    @apply text-gray-900;
    td {
        padding-bottom: 0.75rem;
        font-size: 0.875rem;
        line-height: 1.4;
    }
    td:first-of-type {
        padding-right: 0.625rem;
        font-weight: bold;
        white-space: nowrap;
    }
}
</style>
