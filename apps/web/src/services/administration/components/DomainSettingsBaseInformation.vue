<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PFieldGroup, PHeading, PPaneLayout, PFieldTitle, PCopyButton, PTextInput, PButton,
} from '@spaceone/design-system';

import { store } from '@/store';

import DomainSettingsChangeAdminEmailModal
    from '@/services/administration/components/DomainSettingsChangeAdminEmailModal.vue';


const storeState = reactive({
    domainId: computed<string>(() => store.state.domain.domainId),
    domainName: computed<string>(() => store.state.domain.name),
});
const state = reactive({
    displayName: '',
    adminEmail: '', // TODO: get admin email from API after backend is ready
    isDisplayNameChanged: false,
    adminEmailChangeModalVisible: false,
});

/* Event */
const handleClickChangeAdminEmail = () => {
    state.adminEmailChangeModalVisible = true;
};
</script>

<template>
    <p-pane-layout>
        <p-heading heading-type="sub"
                   :title="$t('IAM.DOMAIN_SETTINGS.BASE_INFORMATION')"
        />
        <div class="content-wrapper">
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.DOMAIN_ID')" />
                <p class="input-wrapper">
                    {{ storeState.domainId }}
                    <p-copy-button :value="storeState.domainId" />
                </p>
            </div>
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.DOMAIN_NAME')" />
                <p class="input-wrapper">
                    {{ storeState.domainName }}
                    <p-copy-button :value="storeState.domainName" />
                </p>
            </div>
            <div class="field-wrapper">
                <p-field-title :label="$t('IAM.DOMAIN_SETTINGS.DISPLAY_NAME')" />
                <div class="input-wrapper">
                    <p-text-input :value.sync="state.displayName" />
                    <p-button class="ml-2"
                              :disabled="!state.isDisplayNameChanged"
                    >
                        {{ $t('IAM.DOMAIN_SETTINGS.SAVE_CHANGE') }}
                    </p-button>
                </div>
            </div>
            <div class="field-wrapper">
                <p-field-group :label="$t('IAM.DOMAIN_SETTINGS.ADMIN_EMAIL')"
                               required
                >
                    <div class="input-wrapper">
                        <p-text-input :value="state.adminEmail"
                                      disabled
                        />
                        <p-button class="ml-2"
                                  style-type="tertiary"
                                  icon-left="ic_edit"
                                  @click="handleClickChangeAdminEmail"
                        >
                            {{ $t('IAM.DOMAIN_SETTINGS.CHANGE') }}
                        </p-button>
                    </div>
                </p-field-group>
            </div>
        </div>
        <domain-settings-change-admin-email-modal :visible.sync="state.adminEmailChangeModalVisible" />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
    .field-wrapper {
        .input-wrapper {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding-top: 0.25rem;
            .p-text-input {
                max-width: 27rem;
                width: 100%;
            }
        }
    }
}
</style>
