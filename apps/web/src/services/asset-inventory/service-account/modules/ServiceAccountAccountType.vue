<script lang="ts" setup>
import {
    PPaneLayout, PHeading, PSelectCard, PI,
} from '@spaceone/design-system';
import {
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type { AccountType } from '@/services/asset-inventory/service-account/type';

interface Props {
    accountType?: AccountType;
    provider?: string;
    showTrustedAccount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    accountType: 'GENERAL',
    provider: undefined,
    showTrustedAccount: false,
});
const emit = defineEmits<{(e: 'change', value: AccountType): void}>();
const { t } = useI18n();

const state = reactive({
    selectedType: 'GENERAL' as AccountType,
});

const handleSelectAccountType = (accountType: AccountType) => {
    state.selectedType = accountType;
    emit('change', accountType);
};

watch(() => props.accountType, (accountType: AccountType) => {
    state.selectedType = accountType;
});

</script>

<template>
    <p-pane-layout class="service-account-account-type">
        <p-heading heading-type="sub"
                   :title="t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ACCOUNT_TYPE_TITLE')"
        />
        <div class="content-wrapper">
            <div class="create-mode-wrapper">
                <div class="card-wrapper">
                    <p-select-card
                        v-model:selected="state.selectedType"
                        :tab-index="0"
                        value="GENERAL"
                        label="General Account"
                        @click="() => handleSelectAccountType('GENERAL')"
                    />
                    <p-select-card
                        v-if="showTrustedAccount"
                        v-model:selected="state.selectedType"
                        :tab-index="1"
                        value="TRUSTED"
                        label="Trusted Account"
                        @click="() => handleSelectAccountType('TRUSTED')"
                    />
                </div>
                <div v-if="showTrustedAccount"
                     class="information-wrapper"
                >
                    <p-i name="ic_info-circle"
                         height="0.875rem"
                         width="0.875rem"
                         color="inherit"
                         class="external-icon"
                    />
                    <div class="help-wrapper">
                        <span>{{ t('INVENTORY.SERVICE_ACCOUNT.DETAIL.TRUST_ACCOUNT_HELP_TEXT') }}</span>
                    </div>
                </div>
            </div>
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.service-account-account-type {
    .content-wrapper {
        padding: 0.5rem 1rem 1.5rem 1rem;

        .create-mode-wrapper {
            @apply w-1/2;
            .card-wrapper {
                @apply flex;
                gap: 0.5rem;
                margin-bottom: 1rem;

                /* custom design-system component - p-select-card */
                :deep(.p-select-card) {
                    max-width: 14.75rem;
                    width: calc(50% - 0.25rem);
                    .marker {
                        display: none;
                    }
                    &.selected {
                        .marker {
                            display: block;
                        }
                    }
                }
            }
            .information-wrapper {
                @apply flex text-gray-700;
                gap: 0.3rem;
                align-content: flex-start;
                padding-bottom: 1rem;
                .help-wrapper {
                    width: calc(100% - 1rem);
                    font-size: 0.75rem;
                }
            }
        }
    }
}
</style>
