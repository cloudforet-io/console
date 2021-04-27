import { PluginObject, VueConstructor } from 'vue';
import VueI18n from 'vue-i18n';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';

interface SpaceoneDSOptions {
    installVueI18n?: boolean;
    installVueCompositionApi?: boolean;
    installFragment?: boolean;
}


const SpaceoneDS: PluginObject<SpaceoneDSOptions> = {
    install(_Vue: VueConstructor, options) {
        if (options?.installVueI18n) _Vue.use(VueI18n);
        if (options?.installVueCompositionApi) _Vue.use(VueCompositionApi);
        if (options?.installFragment) _Vue.use(Fragment.Plugin);
        _Vue.use(Notifications, { velocity });
        _Vue.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });
        _Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
    },
};


export default SpaceoneDS;

/* Languages */
export { messages } from './translations';

/* Components */
export { default as PBackToTopButton } from './navigation/scrolls/back-to-top-button/PBackToTopButton.vue';
export { default as PBadge } from './data-display/badges/PBadge.vue';
export { default as PButton } from './inputs/buttons/button/PButton.vue';
export { default as PEmpty } from './data-display/empty/PEmpty.vue';
export { default as PDivider } from './layouts/divider/PDivider.vue';
export { default as PI } from './foundation/icons/PI.vue';
export { default as PTextInput } from './inputs/input/PTextInput.vue';
export { default as PLabel } from './inputs/forms/label/PLabel.vue';
export { default as PSkeleton } from './feedbacks/loading/skeleton/PSkeleton.vue';
export { default as PCollapsibleToggle } from './inputs/buttons/collapsible-toggle/PCollapsibleToggle.vue';

export { default as PNoticeAlert } from './feedbacks/alert/notice/PNoticeAlert.vue';
export { default as PToastAlert } from './feedbacks/alert/toast/PToastAlert.vue';
export { default as PAnchor } from './inputs/anchors/PAnchor.vue';
export { default as PCopyButton } from './inputs/buttons/copy-button/PCopyButton.vue';
export { default as PIconButton } from './inputs/buttons/icon-button/PIconButton.vue';
export { default as PIconTextButton } from './inputs/buttons/icon-text-button/PIconTextButton.vue';
export { default as PLoadingButton } from './others/deprecated/loading-button/PLoadingButton.vue';
export { default as PToggleButton } from './inputs/buttons/toggle-button/PToggleButton.vue';
export { default as PCardItem } from './others/deprecated/card-item/PCardItem.vue';
export { default as PCollapsiblePanel } from './data-display/collapsible/collapsible-panel/PCollapsiblePanel.vue';
export { default as PCheckBox } from './inputs/checkbox/PCheckBox.vue';
export { default as PFieldGroup } from './inputs/forms/field-group/PFieldGroup.vue';
export { default as PRadio } from './inputs/radio/PRadio.vue';
export { default as PGridLayout } from './others/deprecated/grid-layout/PGridLayout.vue';
export { default as PPaneLayout } from './layouts/pane-layout/PPaneLayout.vue';
export { default as PSidebar } from './layouts/sidebar/PSidebar.vue';
export { default as PTextList } from './others/console/text-list/PTextList.vue';
export { default as PLottie } from './foundation/lottie/PLottie.vue';
export { default as PMarkdown } from './data-display/markdown/PMarkdown.vue';
export { default as PModal } from './feedbacks/modals/modal/PModal.vue';
export { default as PBreadcrumbs } from './navigation/breadcrumbs/PBreadcrumbs.vue';
export { default as PPanelTop } from './data-display/titles/panel-top/PPanelTop.vue';
export { default as PProgressBar } from './data-display/progress-bar/PProgressBar.vue';
export { default as PSearch } from './inputs/search/search/PSearch.vue';
export { default as PSelectableItem } from './others/deprecated/selectable-item/PSelectableItem.vue';
export { default as PStatus } from './data-display/status/PStatus.vue';
export { default as PTabBar } from './navigation/tabs/tab/tab-bar/PTabBar.vue';
export { default as PTag } from './data-display/tags/PTag.vue';
export { default as PTextEditor } from './inputs/text-editor/PTextEditor.vue';
export { default as PTooltip } from './data-display/tooltips/PTooltip.vue';
export { default as PTreeNode } from './data-display/tree/tree-node/PTreeNode.vue';

export { default as PSelectButtonGroup } from './inputs/buttons/select-button-group/PSelectButtonGroup.vue';
export { default as PTooltipButton } from './others/deprecated/tooltip-button/PTooltipButton.vue';
export { default as PChartLoader } from './others/console/charts/chart-loader/PChartLoader.vue';
export { default as PContextMenu } from './inputs/context-menu/PContextMenu.vue';
export { default as PDatePagination } from './navigation/pagination/date-pagination/PDatePagination.vue';
export { default as PDefinition } from './data-display/tables/definition-table/definition/PDefinition.vue';
export { default as PDropdownBtn } from './inputs/dropdown/dropdown-btn/PDropdownBtn.vue';
export { default as PSelectDropdown } from './inputs/dropdown/select-dropdown/PSelectDropdown.vue';
export { default as PDropdownMenuBtn } from './inputs/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
export { default as PDynamicField } from './data-display/dynamic/dynamic-field/PDynamicField.vue';
export { default as PDynamicLayout } from './data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
export { default as PJsonSchemaForm } from './inputs/forms/json-schema-form/PJsonSchemaForm.vue';
export { default as PHorizontalLayout } from './layouts/horizontal-layout/PHorizontalLayout.vue';
export { default as PSearchGridLayout } from './others/deprecated/search-grid-layout/PSearchGridLayout.vue';
export { default as PToolboxGridLayout } from './others/deprecated/toolbox-grid-layout/PToolboxGridLayout.vue';
export { default as PVerticalLayout } from './layouts/vertical-layout/PVerticalLayout.vue';
export { default as PWidgetLayout } from './others/deprecated/widget-layout/PWidgetLayout.vue';
export { default as PLazyImg } from './feedbacks/loading/lazy-img/PLazyImg.vue';
export { default as PSelectableList } from './others/deprecated/selectable-list/PSelectableList.vue';
export { default as PButtonModal } from './feedbacks/modals/button-modal/PButtonModal.vue';
export { default as PDoubleCheckModal } from './others/console/modals/double-check-modal/PDoubleCheckModal.vue';
export { default as PIconModal } from './feedbacks/modals/icon-modal/PIconModal.vue';
export { default as PTableCheckModal } from './others/console/modals/table-modal/PTableCheckModal.vue';
export { default as PPagination } from './navigation/pagination/pagination/PPagination.vue';
export { default as PTextPagination } from './navigation/pagination/text-pagination/PTextPagination.vue';
export { default as PRawData } from './data-display/raw-data/PRawData.vue';
export { default as PAutocompleteSearch } from './inputs/search/autocomplete-search/PAutocompleteSearch.vue';
export { default as PQuerySearch } from './inputs/search/query-search/PQuerySearch.vue';
export { default as PQuerySearchGuide } from './inputs/search/query-search-guide/PQuerySearchGuide.vue';
export { default as PQuerySearchTags } from './inputs/search/query-search-tags/PQuerySearchTags.vue';
export { default as PDataTable } from './data-display/tables/data-table/PDataTable.vue';
export { default as PDefinitionTable } from './data-display/tables/definition-table/PDefinitionTable.vue';
export { default as PQuerySearchTable } from './data-display/tables/query-search-table/PQuerySearchTable.vue';
export { default as PSearchTable } from './data-display/tables/search-table/PSearchTable.vue';
export { default as PToolboxTable } from './data-display/tables/toolbox-table/PToolboxTable.vue';
export { default as PButtonTab } from './others/console/button-tab/PButtonTab.vue';
export { default as PTab } from './navigation/tabs/tab/PTab.vue';
export { default as PPageTitle } from './data-display/titles/page-title/PPageTitle.vue';
export { default as PTree } from './data-display/tree/PTree.vue';
export { default as PProgressWizard } from './navigation/wizards/progress-wizard/PProgressWizard.vue';

export { default as PNotificationBar } from './feedbacks/notification/PNotificationBar.vue';
export { default as PDataLoader } from './feedbacks/loading/data-loader/PDataLoader.vue';

export { default as PToolbox } from './navigation/toolbox/PToolbox.vue';
