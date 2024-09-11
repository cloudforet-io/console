<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PToggleButton,
} from '@cloudforet/mirinae';

import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';


type FolderModel = PublicFolderModel | PrivateFolderModel;
interface Props {
    visible: boolean;
    type?: 'EDIT' | 'CREATE';
    folder?: FolderModel;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'CREATE',
    folder: undefined,
});
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();

const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    isPrivate: false,
    existingNameList: computed<string[]>(() => {
        const _publicNames = dashboardState.publicFolderItems.map((d) => d.name);
        const _privateNames = dashboardState.privateFolderItems.map((d) => d.name);
        const _names = [..._publicNames, ..._privateNames];
        if (props.type === 'EDIT') {
            return _names.filter((d) => d !== props.folder?.name);
        }
        return _names;
    }),
    headerTitle: computed(() => {
        if (props.type === 'EDIT') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.EDIT_FOLDER_NAME');
        return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.CREATE_FOLDER');
    }),
});
const {
    forms: { name },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    initForm,
} = useFormValidator({
    name: undefined as string|undefined,
}, {
    name(value) {
        if (!value) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME_REQUIRED');
        if (state.existingNameList.find((d) => d === value)) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME_DUPLICATED');
        return true;
    },
});

/* Api */
const createFolder = async () => {
    try {
        // fetch api
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_CREATE_FOLDER'), '');
        state.proxyVisible = false;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_CREATE_FOLDER'));
    }
};
const updateFolderName = async () => {
    try {
        // update api
        state.proxyVisible = false;
        showSuccessMessage(i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_S_UPDATE_FOLDER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.ALT_E_UPDATE_FOLDER'));
    }
};

/* Event */
const handleFormConfirm = async () => {
    if (!isAllValid) return;
    if (props.type === 'EDIT') {
        await updateFolderName();
    } else {
        await createFolder();
    }
};
const handleUpdatePrivate = (value: boolean) => {
    state.isPrivate = value;
};

/* Watcher */
watch(() => state.proxyVisible, (visible) => {
    if (visible && props.type === 'EDIT') {
        setForm('name', props.folder?.name);
    } else {
        initForm();
    }
});

</script>

<template>
    <p-button-modal
        :header-title="state.headerTitle"
        size="sm"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleFormConfirm"
    >
        <template #body>
            <p-field-group class="folder-name-input-wrapper"
                           :label="$t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  class="block w-full"
                                  :placeholder="$t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.NAME')"
                                  :invalid="invalid"
                                  @update:value="setForm('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('DASHBOARDS.ALL_DASHBOARDS.FOLDER.MAKE_PRIVATE')"
                           required
            >
                <p-toggle-button :value="state.isPrivate"
                                 @change-toggle="handleUpdatePrivate"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.folder-name-input-wrapper {
    margin-bottom: 2rem;
}
</style>
