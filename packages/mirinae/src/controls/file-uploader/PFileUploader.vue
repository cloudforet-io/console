<template>
    <div class="p-file-uploader">
        <file-pond
            ref="fileRef"
            label-idle="Drag & Drop files here or
            <span class='filepond--label-action'>Browse</span>
            "
            :allow-revert="false"
            :allow-multiple="true"
            :server="serverOption"
            :accepted-file-types="ACCEPTED_FILE_TYPES"
            @updatefiles="handleUpdateFiles"
        />
    </div>
</template>

<script lang="ts">
import {
    defineComponent, reactive, toRefs,
} from 'vue';

import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import vueFilePond from 'vue-filepond';

import { useProxyValue } from '@/hooks';


const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
);
const ACCEPTED_FILE_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/x-msdownload',
    'text/csv',
];
export default defineComponent({
    name: 'PFileUploader',
    components: {
        FilePond,
    },
    model: {
        prop: 'uploadedFiles',
        event: 'update:uploadedFiles',
    },
    props: {
        uploadedFiles: {
            type: Array as () => File[],
            default: () => ([]),
        },
        serverEndpoint: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyUploadedFiles: useProxyValue<File[]>('uploadedFiles', props, emit),
            fileRef: null as Element|null,
        });

        const serverOption = {
            process: (fieldName, file, metadata, load, error, progress, abort) => {
                const formData = new FormData();
                formData.append(fieldName, file, file.name);

                const request = new XMLHttpRequest();
                request.open('POST', props.serverEndpoint ?? '');
                request.upload.onprogress = (e) => {
                    progress(e.lengthComputable, e.loaded, e.total);
                };
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        load(request.responseText);
                    } else {
                        error('Upload Error!');
                    }
                };
                request.send(formData);

                return {
                    abort: () => {
                        request.abort();
                        abort();
                    },
                };
            },
        };

        const handleUpdateFiles = (files: File[]) => {
            state.proxyUploadedFiles = files.map((fileItems) => fileItems);
        };

        return {
            ...toRefs(state),
            ACCEPTED_FILE_TYPES,
            serverOption,
            handleUpdateFiles,
        };
    },
});
</script>

<style lang="postcss">
@import 'filepond/dist/filepond.min.css';

.p-file-uploader {
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
        @apply rounded-md;
    }

    .filepond--file {
        @apply rounded-md;
    }
}
</style>
