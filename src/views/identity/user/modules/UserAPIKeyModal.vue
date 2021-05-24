<template>
    <p-icon-modal :visible.sync="proxyVisible"
                  icon-name="ic_done"
                  size="md"
                  :header-title="$t('IDENTITY.USER.MAIN.API_KEY_MODAL_TITLE')"
                  :button-text="$t('COMPONENT.BUTTON_MODAL.CONFIRM')"
                  @clickButton="onClickConfirm"
    >
        <template #body>
            <article class="alert-wrapper">
                <span class="alert-message">
                    <p-i name="ic_state_duplicated" width="0.75rem" height="0.75rem"
                         class="alert-icon"
                    />
                    {{ $t('IDENTITY.USER.MAIN.API_KEY_ALERT_MSG') }}
                </span>
            </article>
            <p-pane-layout class="box-wrapper">
                <span class="box-header">
                    {{ $t('IDENTITY.USER.MAIN.API_KEY_ID') }}
                </span>
                <p class="box-contents">
                    {{ apiKeyItem.api_key_id }}
                    <p-collapsible-toggle :is-collapsed.sync="isAPICollapsed" class="collapsible-toggle">
                        {{ isAPICollapsed ? $t('IDENTITY.USER.MAIN.API_KEY_SHOW') : $t('IDENTITY.USER.MAIN.API_KEY_HIDE') }}
                    </p-collapsible-toggle>
                    <p-raw-data v-if="!isAPICollapsed" class="m-4" :item="apiItem"
                                folded
                    />
                </p>
                <p-divider class="divider" />
                <p-icon-text-button style-type="primary-dark" outline
                                    name="ic_download" class="download-btn"
                                    @click="onClickDownloadFile(FileType.JSON)"
                >
                    {{ $t('IDENTITY.USER.MAIN.API_KEY_DOWNLOAD_JSON') }}
                </p-icon-text-button>
            </p-pane-layout>
            <p-pane-layout class="box-wrapper">
                <span class="box-header">
                    {{ $t('IDENTITY.USER.MAIN.API_KEY_SPACECTL') }}
                    <div class="box-header-desc">
                        <p-i name="ic_outlined-info"
                             width="1rem" height="1rem"
                             color="inherit"
                             class="info-icon"
                        />
                        <p>{{ $t('IDENTITY.USER.MAIN.API_KEY_SPACECTL_DESC') }}
                            <span class="text">
                                <p-anchor :href="githubLink" target="_blank">
                                    {{ $t('IDENTITY.USER.MAIN.API_KEY_VIEW_MORE') }}
                                </p-anchor>
                            </span>
                        </p>
                    </div>
                </span>
                <p class="box-contents">
                    {{ $t('IDENTITY.USER.MAIN.API_KEY_SPACECTL_CONFIG') }}
                    <p-collapsible-toggle :is-collapsed.sync="isSpacectlCollapsed" class="collapsible-toggle">
                        {{ isSpacectlCollapsed ? $t('IDENTITY.USER.MAIN.API_KEY_SHOW') : $t('IDENTITY.USER.MAIN.API_KEY_HIDE') }}
                    </p-collapsible-toggle>
                    <p-raw-data v-if="!isSpacectlCollapsed" class="m-4" :raw="yamlItem"
                                folded
                    />
                </p>
                <p-divider class="divider" />
                <p-icon-text-button style-type="primary-dark" outline
                                    name="ic_download" class="download-btn"
                                    @click="onClickDownloadFile(FileType.YAML)"
                >
                    {{ $t('IDENTITY.USER.MAIN.API_KEY_DOWNLOAD_YAML') }}
                </p-icon-text-button>
            </p-pane-layout>
        </template>
    </p-icon-modal>
</template>

<script lang="ts">
import {
    PIconModal, PI, PPaneLayout, PDivider, PCollapsibleToggle, PRawData, PIconTextButton, PAnchor,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import yaml from 'js-yaml';
import { APIKeyItem } from '@/views/identity/user/modules/UserAPIKeyTable.vue';

enum FileType {
    JSON = 'json',
    YAML = 'yaml'
}

interface APIItem {
    api_key: string;
}

export default {
    name: 'UserAPIKeyModal',
    components: {
        PIconModal,
        PI,
        PPaneLayout,
        PDivider,
        PCollapsibleToggle,
        PRawData,
        PIconTextButton,
        PAnchor,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        apiKeyItem: {
            type: Object,
            default: null,
        },
        endpoints: {
            type: Object,
            default: null,
        },
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
            isAPICollapsed: true,
            isSpacectlCollapsed: true,
            apiItem: {} as APIItem,
            yamlItem: '',
            githubLink: 'https://github.com/spaceone-dev/spacectl',
        });

        const onClickDownloadFile = (fileType: FileType) => {
            let blob;
            if (fileType === FileType.JSON) blob = new Blob([JSON.stringify(state.apiItem)], { type: 'application/json' });
            if (fileType === FileType.YAML) blob = new Blob([state.yamlItem], { type: 'application/x-yaml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            if (fileType === FileType.JSON) a.download = 'api_key';
            if (fileType === FileType.YAML) a.download = 'spacectl_config';
            a.click();
            a.remove();
        };

        const onClickConfirm = () => {
            context.emit('clickButton');
        };

        const makeYamlItem = () => {
            const apiItem = {
                api_key: props.apiKeyItem.api_key,
            };
            const endpoint = props.endpoints;
            const yamlItem = { ...apiItem, ...endpoint };

            state.yamlItem = yaml.dump(yamlItem, {
                noArrayIndent: false,
                lineWidth: -1,
            });
        };

        (async () => {
            if (props.apiKeyItem) state.apiItem = props.apiKeyItem;
            makeYamlItem();
        })();

        return {
            FileType,
            ...toRefs(state),
            onClickDownloadFile,
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert-wrapper {
    @apply bg-blue-200;
    max-width: 46rem;
    min-height: 3.625rem;
    border-radius: 0.125rem;
    padding: 0.5rem 1rem;
    text-align: left;
    margin-bottom: 1rem;
}
.alert-icon {
    margin-left: -1rem;
    margin-right: 0.125rem;
}
.alert-message {
    @apply text-gray-900;
    display: flex;
    font-size: 0.875rem;
    line-height: 150%;
    .alert-icon {
        flex-shrink: 0;
        margin: 0.3125rem 0.125rem auto 0;
    }
}
.box-wrapper {
    max-width: 46rem;
    min-height: 12rem;
    margin-bottom: 1rem;
    text-align: left;
    padding: 2rem 1rem;
}
.box-header {
    font-size: 1.125rem;
    line-height: 155%;
}
.box-header-desc {
    @apply text-gray-700;
    display: flex;
    font-size: 0.875rem;
    line-height: 150%;
    align-items: center;
    margin-top: 0.5rem;
    .info-icon {
        flex-shrink: 0;
        align-self: flex-start;
        margin: 3px 0.25rem auto 0;
    }
    .text {
        @apply text-blue-500;
        display: inline-flex;
    }
}
.box-contents {
    @apply font-bold;
    padding-left: 1rem;
    margin-top: 2.5rem;
    .collapsible-toggle {
        @apply font-normal;
        display: inline-flex;
        margin-left: 1rem;
    }
}
.divider {
    margin-top: 0.468rem;
    margin-bottom: 0.781rem;
}
.download-btn {
    display: flex;
    margin-left: auto;
}
</style>
