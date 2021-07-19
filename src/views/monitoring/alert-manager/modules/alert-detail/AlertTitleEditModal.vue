<template>
    <p-button-modal
        :header-title="$t('MONITORING.ALERT.DETAIL.EDIT_MODAL_TITLE')"
        centered
        size="sm"
        fade
        :scrollable="false"
        backdrop
        :visible.sync="proxyVisible"
        :disabled="isNameInvalid"
        @confirm="onClickConfirm"
    >
        <template #body>
            <p-field-group :label="$t('PROJECT.DETAIL.MODAL_CREATE_PROJECT_LABEL')"
                           :invalid-text="nameInvalidText"
                           :invalid="isNameInvalid"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="alertTitleInput" class="block w-full" :invalid="isNameInvalid"
                                  :placeholder="alertTitle"
                    />
                </template>
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeProxy } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {i18n} from "@/translations";

export default {
    name: 'AlertTitleEditModal',
    components: {
        PTextInput,
        PFieldGroup,
        PButtonModal,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        alertId: {
            type: String,
            default: null,
        },
        alertTitle: {
            type: String,
            default: null,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            proxyVisible: makeProxy('visible', props, emit),
            alertTitleInput: props.alertTitle,
            nameInvalidText: computed(() => {
                if (state.alertTitleInput.length === 0) {
                    return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_REQUIRED');
                }
                // if (state.alertTitleInput.length > 40) {
                //     return i18n.t('MONITORING.ALERT.ESCALATION_POLICY.FORM.NAME_INVALID_TEXT');
                // }
                return undefined;
            }),
            isNameInvalid: computed(() => !!state.nameInvalidText),
        });

        const updateAlertTitle = async () => {
            try {
                state.loading = true;
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.alertId,
                    title: state.alertTitleInput,
                });
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        const onClickConfirm = async () => {
            await updateAlertTitle();
            state.proxyVisible = false;
            emit('confirm');
        };
        return {
            ...toRefs(state),
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
