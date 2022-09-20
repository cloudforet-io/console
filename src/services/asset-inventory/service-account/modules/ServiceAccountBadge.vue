<template>
    <p-badge :outline="true" :style-type="ACCOUNT_TYPE_BADGE_OPTION[accountType].styleType">
        {{ ACCOUNT_TYPE_BADGE_OPTION[accountType] ? ACCOUNT_TYPE_BADGE_OPTION[accountType].label : '' }}
    </p-badge>
</template>

<script lang="ts">
import { PBadge } from '@spaceone/design-system';
import type { PropType } from 'vue';

import { ACCOUNT_TYPE, ACCOUNT_TYPE_BADGE_OPTION } from '@/services/asset-inventory/service-account/config';
import type { AccountType } from '@/services/asset-inventory/service-account/type';

export default {
    name: 'ServiceAccountBadge',
    components: { PBadge },
    props: {
        accountType: {
            type: String as PropType<AccountType>,
            default: ACCOUNT_TYPE.GENERAL,
            validator(value: AccountType) {
                return Object.values(ACCOUNT_TYPE).includes(value);
            },
        },
    },
    setup() {
        return {
            ACCOUNT_TYPE_BADGE_OPTION,
        };
    },
};
</script>
