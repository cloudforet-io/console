<template>
    <section>
        <article class="desc-wrapper">
            <h2 class="title first">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_1') }}
            </h2>
            <p class="desc">
                <i18n path="IDENTITY.USER.HANDBOOK.DESC_1">
                    <template #document>
                        <p-anchor :href="githubLink" target="_blank" class="link">
                            {{ $t('IDENTITY.USER.HANDBOOK.DESC_1_DOC') }}
                        </p-anchor>
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
            <p-raw-data :raw="codeBlock.installCode" class="code-block" />
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_2-3') }}
            </h3>
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_2-3') }}
            </p>
            <p-raw-data :raw="codeBlock.configCode" class="code-block" />
        </article>
        <article class="desc-wrapper">
            <h2 class="title">
                {{ $t('IDENTITY.USER.HANDBOOK.TITLE_3') }}
            </h2>
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_3-1') }}
            </p>
            <p-raw-data :raw="codeBlock.startCode" class="code-block" />
            <p class="desc">
                {{ $t('IDENTITY.USER.HANDBOOK.DESC_3-2') }}
            </p>
            <p-raw-data :raw="codeBlock.helpCode" class="code-block" />
            <p class="desc last">
                <i18n path="IDENTITY.USER.HANDBOOK.DESC_3-3">
                    <template #document>
                        <p-anchor :href="githubLink" target="_blank" class="link">
                            {{ $t('IDENTITY.USER.HANDBOOK.DESC_1_DOC') }}
                        </p-anchor>
                    </template>
                </i18n>
            </p>
        </article>
    </section>
</template>

<script lang="ts">
import { PAnchor, PRawData } from '@spaceone/design-system';

const githubLink = 'https://github.com/spaceone-dev/spacectl';
const codeBlock = {
    installCode: `${'sudo pip3 install --upgrade pip \n'
      + 'sudo pip3 install spaceone-core spaceone-api --upgrade --pre\n'}${
        'sudo pip3 install spacectl'.replace(/['"]+/g, '')}`,
    configCode: 'spacectl config init -f <spacectl_config.yaml>'.replace(/['"]+/g, ''),
    startCode: 'spacectl api-resources'.replace(/['"]+/g, ''),
    helpCode: 'spacectl --help'.replace(/['"]+/g, ''),
};


export default {
    name: 'UserAPIKeyHandbook',
    components: {
        PAnchor,
        PRawData,
    },
    setup() {
        return {
            githubLink,
            codeBlock,
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
    min-height: auto;
    margin-top: 0.5rem;
}
.link {
    @apply text-blue-500;
    &:hover {
        @apply text-blue-500;
    }
}
</style>
