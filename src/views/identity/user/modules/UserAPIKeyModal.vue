<template>
    <p-icon-modal :visible.sync="proxyVisible"
                  icon-name="ic_done"
                  size="md"
                  :header-title="$t('IDENTITY.USER.MAIN.API_KEY_MODAL_TITLE')"
                  :button-text="$t('COMPONENT.BUTTON_MODAL.CONFIRM') "
                  @clickButton="onClickConfirm"
    >
        <template #body>
            <article class="alert-wrapper">
                <p-i name="ic_state_duplicated" width="0.75rem" height="0.75rem"
                     class="alert-icon"
                />
                <span class="alert-message">{{ $t('IDENTITY.USER.MAIN.API_KEY_ALERT_MSG_1') }}
                    <br> <span class="text-red-500 font-bold">{{ $t('IDENTITY.USER.MAIN.API_KEY_ALERT_MSG_2') }}</span> {{ $t('IDENTITY.USER.MAIN.API_KEY_ALERT_MSG_3') }}
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
                </span>
                <p class="box-contents">
                    {{ apiKeyItem.api_key_id }}
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
    PIconModal, PI, PPaneLayout, PDivider, PCollapsibleToggle, PRawData, PIconTextButton,
} from '@spaceone/design-system';
import { reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import yaml from 'js-yaml';
import { APIKeyItem } from '@/views/identity/user/modules/UserAPIKeyTable.vue';

enum FileType {
    JSON = 'json',
    YAML = 'yaml'
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
            apiItem: {} as APIKeyItem,
            yamlItem: '',
        });

        const onClickDownloadFile = (fileType: FileType) => {
            let blob;
            if (fileType === FileType.JSON) blob = new Blob([JSON.stringify(state.apiItem)], { type: 'application/json' });
            if (fileType === FileType.YAML) blob = new Blob([state.yamlItem], { type: 'application/x-yaml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'download';
            a.click();
            a.remove();
        };

        const onClickConfirm = () => {
            context.emit('clickButton');
        };

        const makeYamlItem = () => {
            state.apiItem = props.apiKeyItem;
            const endpoint = props.endpoints;
            const yamlItem = { ...state.apiItem, ...endpoint };
            state.yamlItem = yaml.dump(yamlItem, {
                noRefs: true,
                sortKeys: true,
            }).trim();
        };

        (async () => {
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
    max-width: 33.5rem;
    min-height: 3.625rem;
    border-radius: 0.125rem;
    padding: 0.5rem 1rem 0.5rem 2rem;
    text-align: left;
    margin-bottom: 1rem;
}
.alert-icon {
    margin-left: -1rem;
    margin-right: 0.125rem;
}
.alert-message {
    @apply text-gray-900;
    font-size: 0.875rem;
    line-height: 150%;
}
.box-wrapper {
    max-width: 33.5rem;
    min-height: 12rem;
    margin-bottom: 1rem;
    text-align: left;
    padding: 2rem 1rem;
}
.box-header {
    font-size: 1.125rem;
    line-height: 155%;
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
