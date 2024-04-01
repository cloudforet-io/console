<script setup lang="ts">
import { PEmpty, PButton } from '@spaceone/design-system';

interface Props {
    isDomainAdmin: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isDomainAdmin: false,
});

const handleCreateWorkspace = () => {

};
</script>

<template>
    <p-empty
        show-image
        show-button
        class="landing-empty-contents"
    >
        <template #button>
            <p-button v-if="props.isDomainAdmin"
                      style-type="primary"
                      size="md"
                      icon-left="ic_plus_bold"
                      class="btn-create"
                      @click="handleCreateWorkspace"
            >
                {{ $t('LADING.CREATE_WORKSPACE') }}
            </p-button>
        </template>
        <div class="not-found">
            <p>{{ $t('LADING.NOT_FOUND_DESC') }}</p>
            <p v-if="props.isDomainAdmin">
                {{ $t('LADING.DESC_CREATE_WORKSPACE') }}
            </p>
        </div>
    </p-empty>
</template>

<style scoped lang="postcss">
.landing-empty-contents {
    padding-top: 1.5rem;
    .not-found {
        @apply flex flex-col text-paragraph-md text-gray-400;
    }
    .btn-create {
        margin-top: 1rem;
    }
}
</style>
