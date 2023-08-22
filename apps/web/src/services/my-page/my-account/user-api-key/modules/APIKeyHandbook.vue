<template>
    <section>
        <article class="desc-wrapper">
            <h2 class="title first">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_1') }}
            </h2>
            <p class="desc">
                <i18n path="IDENTITY.USER.HANDBOOK.DESC_1">
                    <template #document>
                        <p-link :href="githubLink"
                                :action-icon="ACTION_ICON.EXTERNAL_LINK"
                                class="link"
                        >
                            {{ $t('IDENTITY.USER.HANDBOOK.DESC_1_DOC') }}
                        </p-link>
                    </template>
                </i18n>
                <br>
                <strong>{{ $t('IDENTITY.USER.HANDBOOK.DESC_1_REQUIREMENTS') }}</strong>
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_1_PYTHON_VERSION') }}
            </p>
        </article>
        <article class="desc-wrapper">
            <h2 class="title">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_2') }}
            </h2>
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_2-1') }}
            </h3>
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_2-1') }}
            </p>
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_2-2') }}
            </h3>
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_2-2') }}
            </p>
            <pre lang="commandline"
                 class="code-block"
            >
                <code>
                    {{ codeBlock.installCode }}
                </code>
            </pre>
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_2-3') }}
            </h3>
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_2-3') }}
            </p>
            <pre lang="commandline"
                 class="code-block"
            >
                <code>
                    {{ codeBlock.configCode }}
                </code>
            </pre>
        </article>
        <article class="desc-wrapper">
            <h2 class="title">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_3') }}
            </h2>
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_3-1') }}
            </p>
            <pre lang="commandline"
                 class="code-block"
            >
                <code>
                    {{ codeBlock.startCode }}
                </code>
            </pre>
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_3-2') }}
            </p>
            <pre lang="commandline"
                 class="code-block"
            >
                <code>
                    {{ codeBlock.helpCode }}
                </code>
            </pre>
            <p class="desc last">
                <i18n path="IDENTITY.USER.HANDBOOK.DESC_3-3">
                    <template #document>
                        <p-link :href="githubLink"
                                :action-icon="ACTION_ICON.EXTERNAL_LINK"
                                class="link"
                        >
                            {{ $t('IDENTITY.USER.HANDBOOK.DESC_1_DOC') }}
                        </p-link>
                    </template>
                </i18n>
            </p>
        </article>
    </section>
</template>

<script lang="ts">
import { PLink } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

const githubLink = 'https://github.com/cloudforet-io/spacectl';
const codeBlock = {
    installCode: 'sudo pip3 install --upgrade pip \n\n'
      + 'sudo pip3 install spaceone-core spaceone-api --upgrade\n\n'
      + 'sudo pip3 install spacectl',
    configCode: 'spacectl config init -f <spacectl_config.yaml>',
    startCode: 'spacectl api-resources',
    helpCode: 'spacectl --help',
};

export default {
    name: 'UserAPIKeyHandbook',
    components: {
        PLink,
    },
    setup() {
        return {
            githubLink,
            codeBlock,
            ACTION_ICON,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    @apply font-bold;
    font-size: 1rem;
    line-height: 150%;
    margin-top: 1.5rem;
    &.first {
        margin-top: 0;
    }
}
.desc {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    line-height: 150%;
    &.last {
        margin-top: 1.5rem;
    }
}
.sub-title {
    margin-top: 1rem;
    line-height: 150%;
}
.code-block {
    @apply bg-black text-green-300 rounded-lg;
    white-space: pre-line;
    margin-top: 0.5rem;
    padding: 1rem;
    font-size: 0.875rem;
    line-height: 150%;
}

.link {
    @apply text-blue-600;
    &:hover {
        @apply text-blue-600;
    }
}
</style>
