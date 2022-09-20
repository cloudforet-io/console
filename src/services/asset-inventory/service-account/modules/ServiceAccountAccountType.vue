<template>
    <p-pane-layout class="service-account-account-type">
        <p-panel-top :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ACCOUNT_TYPE_TITLE')" />
        <div class="content-wrapper">
            <div class="create-mode-wrapper">
                <div class="card-wrapper">
                    <p-select-card
                        v-model="selectedType"
                        value="GENERAL"
                        label="General Account"
                        @click="() => handleSelectAccountType('GENERAL')"
                    />
                    <p-select-card
                        v-if="TRUST_ACCOUNT_ALLOWED.some((d) => d === provider)"
                        v-model="selectedType"
                        value="TRUST"
                        label="Trust Account"
                        @click="() => handleSelectAccountType('TRUST')"
                    />
                </div>
                <div class="information-wrapper">
                    <p-i name="ic_outlined-info"
                         height="1rem" width="1rem"
                         color="inherit"
                         class="external-icon"
                    />
                    <div class="anchor-wrapper">
                        <span>{{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.TRUST_ACCOUNT_HELP_TEXT') }}</span>
                        <p-anchor class="here-anchor" highlight :text="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.HERE')" />
                    </div>
                </div>
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PSelectCard, PI, PAnchor,
} from '@spaceone/design-system';
import type { PropType, SetupContext } from 'vue';
import {
    reactive, toRefs, defineComponent, watch,
} from 'vue';

import { TRUST_ACCOUNT_ALLOWED } from '@/services/asset-inventory/service-account/config';
import type { AccountType } from '@/services/asset-inventory/service-account/type';


export default defineComponent({
    name: 'ServiceAccountAccountType',
    components: {
        PAnchor,
        PPaneLayout,
        PPanelTop,
        PSelectCard,
        PI,
    },
    props: {
        accountType: {
            type: String as PropType<AccountType>,
            default: 'GENERAL',
        },
        provider: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
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

        return {
            ...toRefs(state),
            TRUST_ACCOUNT_ALLOWED,
            handleSelectAccountType,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-account-type {
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
        .create-mode-wrapper {
            @apply w-1/2;
            .card-wrapper {
                @apply flex;
                gap: 0.5rem;
                margin-bottom: 1rem;

                /* custom design-system component - p-select-card */
                :deep(.p-select-card) {
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
                @apply flex;
                gap: 0.3rem;
                align-content: flex-start;
                .anchor-wrapper {
                    width: calc(100% - 1rem);
                }
                .here-anchor {
                    margin-left: 0.25rem;
                }
            }
        }
    }
}
</style>
