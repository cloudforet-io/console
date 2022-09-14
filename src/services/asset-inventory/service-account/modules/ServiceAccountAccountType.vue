<template>
    <p-pane-layout class="service-account-account-type">
        <!--song-lang-->
        <p-panel-top title="Account Type" />
        <div class="content-wrapper">
            <div v-if="mode === 'CREATE' || mode === 'UPDATE'" class="create-mode-wrapper">
                <div class="card-wrapper">
                    <p-select-card
                        v-model="selectedType"
                        value="GENERAL"
                        label="General Account"
                        class="card"
                    />
                    <p-select-card
                        v-model="selectedType"
                        value="TRUST"
                        label="Trust Account"
                        class="card"
                    />
                </div>
                <div class="information-wrapper">
                    <p-i name="ic_outlined-info"
                         height="1em" width="1em"
                         color="inherit"
                         class="external-icon"
                    />
                    <!--                    song-lang-->
                    <span>Trust Account can allow entities in other AWS accounts belonging to you.
                        Get more details</span>
                    <!--                    song-lang-->
                    <p-anchor highlight text="here" />
                </div>
            </div>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PSelectCard, PI, PAnchor,
} from '@spaceone/design-system';
import type { PropType } from 'vue';
import { computed, reactive, toRefs } from 'vue';

import type { PageMode, AccountType } from '@/services/asset-inventory/service-account/type';


export default {
    name: 'ServiceAccountAccountType',
    components: {
        PAnchor,
        PPaneLayout,
        PPanelTop,
        PSelectCard,
        PI,
    },
    props: {
        mode: {
            type: String as PropType<PageMode>,
            default: 'READ',
        },
        badgeType: {
            type: String as PropType<AccountType>,
            default: 'GENERAL',
        },
    },
    setup(props) {
        const state = reactive({
            selectedType: 'GENERAL' as AccountType,
            badgeType: computed<AccountType>(() => props.badgeType),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.service-account-account-type {
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
        .create-mode-wrapper {
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
                align-items: center;
            }
        }
    }
}
</style>
