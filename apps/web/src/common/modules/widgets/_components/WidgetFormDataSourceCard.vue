<script setup lang="ts">

import {
    PFieldGroup, PDivider, PIconButton, PTextButton, PI,
} from '@spaceone/design-system';

import { violet, white } from '@/styles/colors';

interface Props {
    selected: boolean;
    latestAdded: boolean;
}

const props = defineProps<Props>();

</script>

<template>
    <div class="widget-form-data-source-card">
        <p-i v-if="props.selected"
             class="selected-icon"
             name="ic_checkbox-circle-selected"
             :color="violet[500]"
             width="2rem"
             height="2rem"
        />
        <div class="card-wrapper"
             :class="{ 'selected': props.selected }"
        >
            <div class="card-header">
                <div class="title-wrapper">
                    <div class="title">
                        <p>Data Source 1</p>
                        <p-icon-button class="edit-button"
                                       style-type="transparent"
                                       name="ic_edit-text"
                                       size="sm"
                        />
                    </div>
                    <p-text-button class="delete-button"
                                   icon-left="ic_delete"
                    >
                        Delete
                    </p-text-button>
                </div>
            </div>
            <div class="options-form">
                <p-field-group label="Group by"
                               required
                />
                <p-field-group label="Data Format"
                               required
                />
                <p-divider class="filter-divider" />
            </div>
        </div>
        <div v-if="props.latestAdded"
             class="add-data-source-floating-button"
        >
            <button class="add-button">
                <p-i name="ic_plus"
                     width="1.5rem"
                     height="1.5rem"
                     :color="white"
                />
            </button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-source-card {
    @apply relative flex;

    .selected-icon {
        @apply absolute;
        left: -0.75rem;
        top: -0.75rem;
        z-index: 1;
    }

    .card-wrapper {
        @apply relative border border-gray-300 rounded-lg w-full;
        width: 24rem;
        overflow: hidden;
        &.selected {
            @apply border-violet-600;
            box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        }

        .card-header {
            @apply bg-gray-100;
            height: 4.5rem;
            padding: 0.5rem 0.75rem;

            .title-wrapper {
                @apply flex items-center justify-between;
                .title {
                    @apply text-paragraph-sm font-bold flex items-center;
                    gap: 0.125rem;
                }
            }
        }
        .options-form {
            @apply bg-white;
            padding: 0.75rem;

            .filter-divider {
                margin: 0.75rem 0;
            }
        }
    }

    .add-data-source-floating-button {
        @apply flex items-center justify-center;
        width: 4rem;
        height: 4rem;

        .add-button {
            @apply relative flex items-center justify-center border border-violet-400 bg-violet-300 rounded-full;
            width: 2.5rem;
            height: 2.5rem;

            &::before {
                @apply bg-violet-400;
                content: '';
                position: absolute;
                left: -0.8125rem;
                top: 50%;
                transform: translateY(-50%);
                width: 0.75rem;
                height: 0.0625rem;
            }
        }
    }
}
</style>
