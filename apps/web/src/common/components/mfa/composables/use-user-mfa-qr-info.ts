import { useQRCode } from '@vueuse/integrations/useQRCode';
import { computed } from 'vue';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';

import { useUserProfileEnableMfaQuery } from '@/common/components/mfa/composables/use-user-profile-enable-mfa-query';


export const useUserMfaQrInfo = () => {
    const { data: userInfo, isFetching, refetch } = useUserProfileEnableMfaQuery({
        params: computed(() => ({
            mfa_type: MULTI_FACTOR_AUTH_TYPE.OTP,
            options: {},
        })),
    });

    const qrUri = computed<string>(() => userInfo.value?.mfa?.options?.otp_qrcode_uri || '');

    return {
        isLoading: isFetching,
        qrCode: useQRCode(qrUri, { margin: 0 }),
        passKey: computed(() => qrUri.value?.match(/secret=([^&]*)/)?.[1] || ''),
        refetchQrInfo: refetch,
    };
};
