<script lang="ts" setup>
import { PBadge } from '@spaceone/design-system';
import type { PropType } from 'vue';
import {
    computed, reactive,
} from 'vue';

import { ACCOUNT_TYPE, ACCOUNT_TYPE_BADGE_OPTION } from '@/services/asset-inventory/service-account/config';
import type { AccountType } from '@/services/asset-inventory/service-account/type';

const props = defineProps({
    accountType: {
        type: String as PropType<AccountType>,
        default: ACCOUNT_TYPE.GENERAL,
        validator(value: AccountType) {
            return Object.values(ACCOUNT_TYPE).includes(value);
        },
    },
    isManaged: {
        type: Boolean,
        default: false,
    },
});

const state = reactive({
    badgeOption: computed(() => {
        if (props.accountType === ACCOUNT_TYPE.GENERAL) return ACCOUNT_TYPE_BADGE_OPTION[props.accountType];
        const trustAccountType = props.isManaged ? 'TRUSTED-MANAGED' : ACCOUNT_TYPE.TRUSTED;
        return ACCOUNT_TYPE_BADGE_OPTION[trustAccountType];
    }),
});

</script>

<template>
    <p-badge :style-type="state.badgeOption.styleType"
             badge-type="subtle"
    >
        {{ state.badgeOption.label }}
    </p-badge>
</template>
