<template>
    <p-pane-layout class="service-account-project-detail">
        <p-panel-top :title="$t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE')">
            <template #extra>
                <p-button icon="ic_edit">
                    <!--song-lang-->
                    Edit
                </p-button>
            </template>
        </p-panel-top>
        <div class="content-wrapper">
            <p-anchor :href="state.projectLink">
                {{ state.projectName }}
            </p-anchor>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout, PPanelTop, PButton, PAnchor,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';


import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { referenceRouter } from '@/lib/reference/referenceRouter';


export default {
    name: 'ServiceAccountProjectDetail',
    components: {
        PPaneLayout,
        PPanelTop,
        PButton,
        PAnchor,
    },
    props: {
        isValid: {
            type: Boolean,
            default: undefined,
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            projects: computed(() => store.getters['reference/projectItems']),
            projectName: computed(() => {
                if (props.projectId) {
                    return state.projects[props.projectId]?.label ?? '';
                }
                return '';
            }),
            projectLink: computed(() => {
                if (props.projectId) {
                    return SpaceRouter.router.resolve(referenceRouter(props.projectId, {
                        resource_type: 'identity.Project',
                    })).href;
                }
                return undefined;
            }),
        });


        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
            ]);
        })();

        return {
            state,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-project-detail {
    .p-panel-top::v-deep {
        .extra {
            text-align: right;
        }
    }
    .content-wrapper {
        padding: 0.5rem 1rem 2.5rem 1rem;
        .project-select-dropdown {
            width: 50%;
        }
    }

    @screen tablet {
        .content-wrapper {
            .project-select-dropdown {
                width: 100%;
            }
        }
    }
}
</style>
