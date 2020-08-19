<template>
    <div>
        <div id="nav">
            <p-button style-type="primary" @click="exportPdf()">
                export
            </p-button>
        </div>
        <div>
            <VueHtml2pdf
                ref="html2Pdf"
                :show-layout="true"
                :preview-modal="true"
                :paginate-elements-by-height="1400"
                filename="hee hee"
                :pdf-quality="2"
                pdf-format="a4"
                pdf-orientation="portrait"
                pdf-content-width="100%"
            >
                <section slot="pdf-content" class="bg-blue-100">
                    <div>
                        <div>test</div>
                    </div>
                    <div class="html2pdf__page-break" />

                    <div>
                        <div>1test</div>
                    </div>
                    <div class="html2pdf__page-break" />

                    <div>
                        <div>test3</div>
                    </div>
                    <div class="html2pdf__page-break" />

                    <div>
                        <div class="w-full">
                            <PPageTitle class="mt-4">
                                <template #title>
                                    Choice Data Mode
                                </template>
                            </PPageTitle>
                            <div class="flex flex-col">
                                <div class="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                                    <div class="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
                                        <table class="min-w-full">
                                            <thead>
                                                <tr>
                                                    <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                        Title
                                                    </th>
                                                    <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    <th class="px-6 py-3 border-b border-gray-200 bg-gray-50" />
                                                </tr>
                                            </thead>
                                            <tbody class="bg-white">
                                                <tr>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <div class="flex items-center">
                                                            <div class="flex-shrink-0 h-10 w-10">
                                                                <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                                                            </div>
                                                            <div class="ml-4">
                                                                <div class="text-sm leading-5 font-medium text-gray-900">
                                                                    Bernard Lane
                                                                </div>
                                                                <div class="text-sm leading-5 text-gray-500">
                                                                    bernardlane@example.com
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <div class="text-sm leading-5 text-gray-900">
                                                            Director
                                                        </div>
                                                        <div class="text-sm leading-5 text-gray-500">
                                                            Human Resources
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                                                        Owner
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                                        <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <div class="flex items-center">
                                                            <div class="flex-shrink-0 h-10 w-10">
                                                                <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1532910404247-7ee9488d7292?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                                                            </div>
                                                            <div class="ml-4">
                                                                <div class="text-sm leading-5 font-medium text-gray-900">
                                                                    Bernard Lane
                                                                </div>
                                                                <div class="text-sm leading-5 text-gray-500">
                                                                    bernardlane@example.com
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <div class="text-sm leading-5 text-gray-900">
                                                            Director
                                                        </div>
                                                        <div class="text-sm leading-5 text-gray-500">
                                                            Human Resources
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                                                        Owner
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                                        <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <div class="flex items-center">
                                                            <div class="flex-shrink-0 h-10 w-10">
                                                                <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1505503693641-1926193e8d57?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                                                            </div>
                                                            <div class="ml-4">
                                                                <div class="text-sm leading-5 font-medium text-gray-900">
                                                                    Bernard Lane
                                                                </div>
                                                                <div class="text-sm leading-5 text-gray-500">
                                                                    bernardlane@example.com
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <div class="text-sm leading-5 text-gray-900">
                                                            Director
                                                        </div>
                                                        <div class="text-sm leading-5 text-gray-500">
                                                            Human Resources
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            Inactive
                                                        </span>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                                                        Owner
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                                        <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="px-6 py-4 whitespace-no-wrap">
                                                        <div class="flex items-center">
                                                            <div class="flex-shrink-0 h-10 w-10">
                                                                <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                                                            </div>
                                                            <div class="ml-4">
                                                                <div class="text-sm leading-5 font-medium text-gray-900">
                                                                    Bernard Lane
                                                                </div>
                                                                <div class="text-sm leading-5 text-gray-500">
                                                                    bernardlane@example.com
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap">
                                                        <div class="text-sm leading-5 text-gray-900">
                                                            Director
                                                        </div>
                                                        <div class="text-sm leading-5 text-gray-500">
                                                            Human Resources
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap">
                                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            Inactive
                                                        </span>
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                                        Owner
                                                    </td>
                                                    <td class="px-6 py-4 whitespace-no-wrap text-right text-sm leading-5 font-medium">
                                                        <a href="#" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="html2pdf__page-break" />
                    <div>
                        <div class="w-full">
                            <div class="text-xl my-8">
                                header
                            </div>
                            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                                        Applicant Information
                                    </h3>
                                    <p class="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
                                        Personal details and application.
                                    </p>
                                </div>
                                <div>
                                    <dl>
                                        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt class="text-sm leading-5 font-medium text-gray-500">
                                                Full name
                                            </dt>
                                            <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                                Margot Foster
                                            </dd>
                                        </div>
                                        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt class="text-sm leading-5 font-medium text-gray-500">
                                                Application for
                                            </dt>
                                            <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                                Backend Developer
                                            </dd>
                                        </div>
                                        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt class="text-sm leading-5 font-medium text-gray-500">
                                                Email address
                                            </dt>
                                            <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                                margotfoster@example.com
                                            </dd>
                                        </div>
                                        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt class="text-sm leading-5 font-medium text-gray-500">
                                                Salary expectation
                                            </dt>
                                            <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                                $120,000
                                            </dd>
                                        </div>
                                        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt class="text-sm leading-5 font-medium text-gray-500">
                                                About
                                            </dt>
                                            <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                                Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
                                            </dd>
                                        </div>
                                        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt class="text-sm leading-5 font-medium text-gray-500">
                                                Attachments
                                            </dt>
                                            <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                                                <ul class="border border-gray-200 rounded-md">
                                                    <li class="pl-3 pr-4 py-3 flex items-center justify-between text-sm leading-5">
                                                        <div class="w-0 flex-1 flex items-center">
                                                            <svg class="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                                                            </svg>
                                                            <span class="ml-2 flex-1 w-0 truncate">
                                                                resume_back_end_developer.pdf
                                                            </span>
                                                        </div>
                                                        <div class="ml-4 flex-shrink-0">
                                                            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                                                                Download
                                                            </a>
                                                        </div>
                                                    </li>
                                                    <li class="border-t border-gray-200 pl-3 pr-4 py-3 flex items-center justify-between text-sm leading-5">
                                                        <div class="w-0 flex-1 flex items-center">
                                                            <svg class="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                                                            </svg>
                                                            <span class="ml-2 flex-1 w-0 truncate">
                                                                coverletter_back_end_developer.pdf
                                                            </span>
                                                        </div>
                                                        <div class="ml-4 flex-shrink-0">
                                                            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                                                                Download
                                                            </a>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </VueHtml2pdf>
        </div>
    </div>
</template>
<script lang="ts">
import {
    ref, Ref, onMounted,
} from '@vue/composition-api';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import VueHtml2pdf from 'vue-html2pdf';
import html2pdf from 'html2pdf.js';


export default {
    name: 'ExportPdf',
    components: {
        PPageTitle,
        PButton,
        VueHtml2pdf,
    },
    setup() {
        const html2Pdf: Ref<VueHtml2pdf> = ref(null);
        const exportPdf = () => {
            html2Pdf.value.generatePdf();
        };
        onMounted(() => {
            html2Pdf.value.downloadPdf = async () => {
                const _this = html2Pdf.value;
                console.debug(this, '가로채기');
                const element = _this.$refs.pdfContent;


                const opt = {
                    margin: 0,

                    filename: `${_this.filename}.pdf`,

                    image: {
                        type: 'jpeg',
                        quality: 'png',
                    },

                    html2canvas: {
                        scale: 2,
                    },

                    jsPDF: {
                        unit: 'mm',
                        format: _this.pdfFormat,
                        orientation: _this.pdfOrientation,
                    },
                };

                let pdfBlobUrl;
                if (_this.previewModal) {
                    // this.setNewTab()

                    pdfBlobUrl = await html2pdf().set(opt).from(element).output('bloburl');
                    _this.pdfFile = pdfBlobUrl;
                } else {
                    // Download PDF
                    pdfBlobUrl = await html2pdf().set(opt).from(element).save()
                        .output('bloburl');
                }

                const res = await fetch(pdfBlobUrl);
                const blobFile = await res.blob();

                _this.progress = 100;

                _this.$emit('hasGenerated', blobFile);
            };
            console.debug(html2Pdf.value);
        });
        return {
            exportPdf,
            html2Pdf,
        };
    },
};
</script>

<style lang="postcss" scoped>
    #nav{
        @apply bg-white rounded-sm p-4 border-gray-300 m-4 border;
        z-index: 999999;
        right: 0px;
        position: fixed;
    }
    .html2pdf__page-break{
        @apply py-4 px-8;
    }
</style>
