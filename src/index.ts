import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import Codemirror from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import '@/styles/style.pcss';


import PButton from './atoms/buttons/PButton.vue';
import PEmpty from './atoms/empty/PEmpty.vue';
import PHr from './atoms/hr/PHr.vue';
import PI from './atoms/icons/PI.vue';
import PTextInput from './atoms/inputs/PTextInput.vue';
import PLabel from './atoms/labels/PLabel.vue';
import PSkeleton from './atoms/skeletons/PSkeleton.vue';

import PNoticeAlert from './molecules/alert/notice/PNoticeAlert.vue';
import PToastAlert from './molecules/alert/toast/PToastAlert.vue';
import PAnchor from './molecules/anchors/PAnchor.vue';
import PCopyButton from './molecules/buttons/copy-button/PCopyButton.vue';
import PIconButton from './molecules/buttons/icon-button/PIconButton.vue';
import PIconTextButton from './molecules/buttons/icon-text-button/PIconTextButton.vue';
import PLoadingButton from './molecules/buttons/loading-button/PLoadingButton.vue';
import PToggleButton from './molecules/buttons/toggle-button/PToggleButton.vue';
import PCardItem from './molecules/cards/PCardItem.vue';
import PChartD3 from './molecules/charts/PChartD3.vue';
import PCollapsiblePanel from './molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';
import PCheckBox from './molecules/forms/checkbox/PCheckBox.vue';
import PFieldGroup from './molecules/forms/field-group/PFieldGroup.vue';
import PRadio from './molecules/forms/radio/PRadio.vue';
import PCardLayout from './molecules/layouts/card-layout/PCardLayout.vue';
import PGridLayout from './molecules/layouts/grid-layout/PGridLayout.vue';
import PPaneLayout from './molecules/layouts/pane-layout/PPaneLayout.vue';
import PTextList from './molecules/lists/text-list/PTextList.vue';
import PLottie from './molecules/lottie/PLottie.vue';
import PMarkdown from './molecules/markdown/PMarkdown.vue';
import PModal from './molecules/modals/PModal.vue';
import PPageNavigation from './molecules/page-navigation/PPageNavigation.vue';
import PPanelTop from './molecules/panel/panel-top/PPanelTop.vue';
import PProgressBar from './molecules/progress-bar/PProgressBar.vue';
import PSearch from './molecules/search/PSearch.vue';
import PSelectableItem from './molecules/selectable-item/PSelectableItem.vue';
import PSelectBtnGroupSkeleton from './molecules/skeletons/PSelectBtnGroupSkeleton.vue';
import PStatus from './molecules/status/PStatus.vue';
import PProgressTabBar from './molecules/tabs/progress-tab-bar/PProgressTabBar.vue';
import PTabBar from './molecules/tabs/tab-bar/PTabBar.vue';
import PTag from './molecules/tags/PTag.vue';
import PTextEditor from './molecules/text-editor/text-editor/PTextEditor.vue';
import PTooltip from './molecules/tooltips/PTooltip.vue';
import PTreeNode from './molecules/tree-node/PTreeNode.vue';

import PSelectBtnGroup from './organisms/buttons/select-btn-group/PSelectBtnGroup.vue';
import PTooltipButton from './organisms/buttons/tooltip-button/PTooltipButton.vue';
import PChartLoader from './organisms/charts/chart-loader/PChartLoader.vue';
import PMetricChart from './organisms/charts/metric-chart/PMetricChart.vue';
import PContextMenu from './organisms/context-menu/PContextMenu.vue';
import PDatePagination from './organisms/date-pagination/PDatePagination.vue';
import PDefinition from './organisms/definition/PDefinition.vue';
import PDropdownBtn from './organisms/dropdown/dropdown-btn/PDropdownBtn.vue';
import PSelectDropdown from './organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PDropdownMenuBtn from './organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PDynamicField from './organisms/dynamic-field/PDynamicField.vue';
import PDynamicLayout from './organisms/dynamic-layout/PDynamicLayout.vue';
import PJsonSchemaForm from './organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import PBoardLayout from './organisms/layouts/board-layout/PBoardLayout.vue';
import PHorizontalLayout from './organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PSearchGridLayout from './organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import PToolboxGridLayout from './organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
import PVerticalLayout from './organisms/layouts/vertical-layout/PVerticalLayout.vue';
import PWidgetLayout from './organisms/layouts/widget-layout/PWidgetLayout.vue';
import PLazyImg from './organisms/lazy-img/PLazyImg.vue';
import PSelectableList from './organisms/lists/selectable-list/PSelectableList.vue';
import PButtonModal from './organisms/modals/button-modal/PButtonModal.vue';
import PContentModal from './organisms/modals/content-modal/PContentModal.vue';
import PDoubleCheckModal from './organisms/modals/double-check-modal/PDoubleCheckModal.vue';
import PIconModal from './organisms/modals/icon-modal/PIconModal.vue';
import PTableCheckModal from './organisms/modals/table-modal/PTableCheckModal.vue';
import PPagination from './organisms/paginations/pagination/PPagination.vue';
import PTextPagination from './organisms/paginations/text-pagination/PTextPagination.vue';
import PRawData from './organisms/raw-data/PRawData.vue';
import PAutocompleteSearch from './organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import PQuerySearch from './organisms/search/query-search/PQuerySearch.vue';
import PQuerySearchGuide from './organisms/search/query-search-guide/PQuerySearchGuide.vue';
import PQuerySearchTags from './organisms/search/query-search-tags/PQuerySearchTags.vue';
import PDataTable from './organisms/tables/data-table/PDataTable.vue';
import PDefinitionTable from './organisms/tables/definition-table/PDefinitionTable.vue';
import PQuerySearchTable from './organisms/tables/query-search-table/PQuerySearchTable.vue';
import PSearchTable from './organisms/tables/search-table/PSearchTable.vue';
import PToolboxTable from './organisms/tables/toolbox-table/PToolboxTable.vue';
import PButtonTab from './organisms/tabs/button-tab/PButtonTab.vue';
import PTab from './organisms/tabs/tab/PTab.vue';
import PPageTitle from './organisms/title/page-title/PPageTitle.vue';
import PTree from './organisms/tree/PTree.vue';
import PProgressWizard from './organisms/wizards/progress-wizard/PProgressWizard.vue';


const components = {
    PButton,
    PEmpty,
    PHr,
    PI,
    PTextInput,
    PLabel,
    PSkeleton,
    PNoticeAlert,
    PToastAlert,
    PAnchor,
    PCopyButton,
    PIconButton,
    PIconTextButton,
    PLoadingButton,
    PToggleButton,
    PCardItem,
    PChartD3,
    PCollapsiblePanel,
    PCheckBox,
    PFieldGroup,
    PRadio,
    PCardLayout,
    PGridLayout,
    PPaneLayout,
    PTextList,
    PLottie,
    PMarkdown,
    PModal,
    PPageNavigation,
    PPanelTop,
    PProgressBar,
    PSearch,
    PSelectableItem,
    PSelectBtnGroupSkeleton,
    PStatus,
    PProgressTabBar,
    PTabBar,
    PTag,
    PTextEditor,
    PTooltip,
    PTreeNode,
    PSelectBtnGroup,
    PTooltipButton,
    PChartLoader,
    PMetricChart,
    PContextMenu,
    PDatePagination,
    PDefinition,
    PDropdownBtn,
    PSelectDropdown,
    PDropdownMenuBtn,
    PDynamicField,
    PDynamicLayout,
    PJsonSchemaForm,
    PBoardLayout,
    PHorizontalLayout,
    PSearchGridLayout,
    PToolboxGridLayout,
    PVerticalLayout,
    PWidgetLayout,
    PLazyImg,
    PSelectableList,
    PButtonModal,
    PContentModal,
    PDoubleCheckModal,
    PIconModal,
    PTableCheckModal,
    PPagination,
    PTextPagination,
    PRawData,
    PAutocompleteSearch,
    PQuerySearch,
    PQuerySearchGuide,
    PQuerySearchTags,
    PDataTable,
    PDefinitionTable,
    PQuerySearchTable,
    PSearchTable,
    PToolboxTable,
    PButtonTab,
    PTab,
    PPageTitle,
    PTree,
    PProgressWizard,
};


export default {
    PButton,
    PEmpty,
    PHr,
    PI,
    PTextInput,
    PLabel,
    PSkeleton,
    PNoticeAlert,
    PToastAlert,
    PAnchor,
    PCopyButton,
    PIconButton,
    PIconTextButton,
    PLoadingButton,
    PToggleButton,
    PCardItem,
    PChartD3,
    PCollapsiblePanel,
    PCheckBox,
    PFieldGroup,
    PRadio,
    PCardLayout,
    PGridLayout,
    PPaneLayout,
    PTextList,
    PLottie,
    PMarkdown,
    PModal,
    PPageNavigation,
    PPanelTop,
    PProgressBar,
    PSearch,
    PSelectableItem,
    PSelectBtnGroupSkeleton,
    PStatus,
    PProgressTabBar,
    PTabBar,
    PTag,
    PTextEditor,
    PTooltip,
    PTreeNode,
    PSelectBtnGroup,
    PTooltipButton,
    PChartLoader,
    PMetricChart,
    PContextMenu,
    PDatePagination,
    PDefinition,
    PDropdownBtn,
    PSelectDropdown,
    PDropdownMenuBtn,
    PDynamicField,
    PDynamicLayout,
    PJsonSchemaForm,
    PBoardLayout,
    PHorizontalLayout,
    PSearchGridLayout,
    PToolboxGridLayout,
    PVerticalLayout,
    PWidgetLayout,
    PLazyImg,
    PSelectableList,
    PButtonModal,
    PContentModal,
    PDoubleCheckModal,
    PIconModal,
    PTableCheckModal,
    PPagination,
    PTextPagination,
    PRawData,
    PAutocompleteSearch,
    PQuerySearch,
    PQuerySearchGuide,
    PQuerySearchTags,
    PDataTable,
    PDefinitionTable,
    PQuerySearchTable,
    PSearchTable,
    PToolboxTable,
    PButtonTab,
    PTab,
    PPageTitle,
    PTree,
    PProgressWizard,
    install(Vue) {
        Vue.use(VueCompositionApi);
        Vue.use(Notifications, { velocity });
        Vue.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });

        Vue.use(Fragment.Plugin);
        Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        Vue.use(Codemirror);

        // Object.keys(components).forEach((name) => {
        //     Vue.component(name, components[name]);
        // });
    },
};
