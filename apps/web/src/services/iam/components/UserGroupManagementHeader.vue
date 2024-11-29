<script lang="ts" setup>
import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';

const handleCreateGroup = () => {
    console.log('TODO: handleCreateGroup');
};
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.USER_GROUP.TITLE')"
                           use-selected-count
                           use-total-count
                />
            </template>
            <template #extra>
                <div class="toolbox-wrapper">
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleCreateGroup"
                    >
                        <span>{{ $t('IAM.USER_GROUP.CREATE') }}</span>
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
    </div>
</template>
