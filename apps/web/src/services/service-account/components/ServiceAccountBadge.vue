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

import { PBadge } from '@cloudforet/mirinae';

import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { AccountType } from '@/api-clients/identity/service-account/schema/type';

import { ACCOUNT_TYPE_BADGE_OPTION } from '@/services/service-account/constants/service-account-constant';


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
