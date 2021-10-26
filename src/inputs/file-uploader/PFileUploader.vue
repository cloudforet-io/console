<template>
    <div id="app">
        <file-pond
            ref="pond"
            label-idle="Drag & Drop files here or
            <span class='filepond--label-action'>Browse</span>
            "
            allow-multiple="true"
            :accepted-file-types="ACCEPTED_FILE_TYPES"
            :files="myFiles"
            @updatefiles="handleUpdateFiles"
        />
    </div>
</template>

<script lang="ts">
import vueFilePond from 'vue-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeOptionalProxy } from '@/util/composition-helpers';

const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
);
const ACCEPTED_FILE_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/x-msdownload',
    'text/csv',
];
export default {
    name: 'FilePondDemo',
    components: {
        FilePond,
    },
    props: {
        uploadedFiles: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            myFiles: [],
            proxyUploadedFiles: makeOptionalProxy<File[]>('uploadedFiles', vm, props.uploadedFiles),
        });
        const handleUpdateFiles = (files: File[]) => {
            state.proxyUploadedFiles = files.map<File[]>(d => d.file);
        };
        return {
            ...toRefs(state),
            ACCEPTED_FILE_TYPES,
            handleUpdateFiles,
        };
    },
};
</script>

<style lang="postcss">
@import 'filepond/dist/filepond.min.css';

.filepond--root .filepond--credits {
    display: none;
}
.filepond--label-action {
    @apply text-secondary;
    text-decoration: underline;
}
.filepond--drop-label {
    @apply bg-blue-200 rounded-md;
}
.filepond--drip {
    @apply bg-blue-200;
    opacity: 1;
    min-height: 5rem;
}
.filepond--drop-label.filepond--drop-label label {
    @apply text-gray-700;
    font-size: 0.875rem;
}
.filepond--item-panel {
    @apply bg-white rounded-md;
}

.filepond--file {
    @apply rounded-md text-gray-900;
}
[data-filepond-item-state*='error'] .filepond--item-panel,
[data-filepond-item-state*='invalid'] .filepond--item-panel {
    @apply bg-red-200 rounded-md;
}
</style>
