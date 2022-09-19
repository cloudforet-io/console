<template>
    <p-pane-layout class="service-account-account-type">
        <!--song-lang-->
        <p-panel-top title="Account Type" />
        <div class="content-wrapper">
            <div class="create-mode-wrapper">
                <div class="card-wrapper">
                    <p-select-card
                        v-model="selectedType"
                        value="GENERAL"
                        label="General Account"
                        class="card"
                        @click="() => handleSelectAccountType('GENERAL')"
                    />
                    <p-select-card
                        v-if="TRUST_ACCOUNT_ALLOWED.some((d) => d === provider)"
                        v-model="selectedType"
                        value="TRUST"
                        label="Trust Account"
                        class="card"
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
                        <!--                    song-lang-->
                        <span>Trust Account can allow entities in other AWS accounts belonging to you.
                            Get more details</span>
                        <!--                    song-lang-->
                        <p-anchor class="here-anchor" highlight text="here" />
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
                .card {
                    width: calc(50% - 0.25rem);
                    &::v-deep {
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
