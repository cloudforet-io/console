<template>
    <p-badge :style-type="badgeOption.styleType"
             badge-type="subtle"
    >
        {{ badgeOption.label }}
    </p-badge>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PBadge } from '@spaceone/design-system';

import { ACCOUNT_TYPE, ACCOUNT_TYPE_BADGE_OPTION } from '@/services/asset-inventory/service-account/config';
import type { AccountType } from '@/services/asset-inventory/service-account/type';

interface Props {
    accountType: AccountType;
    isManaged: boolean;
}

export default defineComponent<Props>({
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
        isManaged: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            badgeOption: computed(() => {
                if (props.accountType === ACCOUNT_TYPE.GENERAL) return ACCOUNT_TYPE_BADGE_OPTION[props.accountType];
                const trustAccountType = props.isManaged ? 'TRUSTED-MANAGED' : ACCOUNT_TYPE.TRUSTED;
                return ACCOUNT_TYPE_BADGE_OPTION[trustAccountType];
            }),
        });
        return {
            ...toRefs(state),
            ACCOUNT_TYPE_BADGE_OPTION,
        };
    },
});
</script>
