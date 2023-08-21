<template>
    <section>
        <article class="desc-wrapper">
            <h2 class="header2">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE') }}
            </h2>
            <p class="desc2">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_USER') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_USER_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_ADMIN') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.ROLE_TYPE_ADMIN_DESC') }}
            </p>
        </article>
        <p-divider class="divider" />
        <article class="desc-wrapper">
            <h2 class="header2">
                {{ $t('IAM.ROLE.HANDBOOK.PAGE_ACCESS') }}
            </h2>
            <p class="desc2">
                {{ $t('IAM.ROLE.HANDBOOK.PAGE_ACCESS_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.PAGE_ACCESS_VIEW') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.PAGE_ACCESS_VIEW_DESC') }}
            </p>
            <h4 class="header4">
                {{ $t('IAM.ROLE.HANDBOOK.PAGE_ACCESS_MANAGE') }}
            </h4>
            <p class="desc4">
                {{ $t('IAM.ROLE.HANDBOOK.PAGE_ACCESS_MANAGE_DESC') }}
            </p>
        </article>
        <p-divider class="divider" />
        <h2 class="header2">
            {{ $t('IAM.ROLE.HANDBOOK.API_POLICY') }}
        </h2>
        <p class="desc2">
            {{ $t('IAM.ROLE.HANDBOOK.API_POLICY_DESC') }}
        </p>
        <p class="desc4">
            {{ $t('IAM.ROLE.HANDBOOK.API_POLICY_CREATE') }}
            <p-link :highlight="true"
                    :to="{
                        name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME,
                    }"
            >
                {{ $t('IAM.ROLE.HANDBOOK.API_POLICY_LINK') }}
            </p-link>
        </p>
    </section>
</template>

<script lang="ts">
import { PLink, PDivider } from '@spaceone/design-system';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

export default {
    name: 'RoleCreateEditHandbook',
    components: {
        PLink,
        PDivider,
    },
    setup() {
        return {
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.header2 {
    @apply font-bold;
    font-size: 1rem;
    line-height: 1.5rem;
    margin-bottom: 0.5rem;
}

.header4 {
    @apply font-bold;
    font-size: 0.875rem;
    line-height: 1.3125rem;
    margin: 0.5rem 0;
}
.desc2 {
    font-size: 1rem;
    line-height: 1.5rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
}
.desc4 {
    font-size: 0.875rem;
    line-height: 1.3125rem;
    margin-bottom: 1.5rem;
    .p-link {
        line-height: 1.3125;
    }
    &:last-child {
        margin-bottom: 0;
    }
}
.divider {
    margin-top: 1rem;
    margin-bottom: 1.25rem;
}
</style>
