import { PluginObject, VueConstructor } from 'vue';
import VueI18n, { LocaleMessageObject } from 'vue-i18n';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import '@/styles/style.pcss';

import componentKO from '@/translations/language-pack/ko.json';
import componentEN from '@/translations/language-pack/en.json';
import componentJA from '@/translations/language-pack/ja.json';


// simple recursive remove keys with empty value.
const removeEmpty = (obj: object | any): LocaleMessageObject => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

interface SpaceoneDSOptions {
    appSelector?: string;
}


const SpaceoneDS: PluginObject<SpaceoneDSOptions> = {
    install(_Vue: VueConstructor, options) {
        _Vue.use(VueI18n);
        _Vue.use(VueCompositionApi);
        _Vue.use(Notifications, { velocity });
        _Vue.use(SvgIcon, {
            tagName: 'svgicon',
            classPrefix: 'p-i',
        });

        _Vue.use(Fragment.Plugin);
        _Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });


        const i18n = new VueI18n({
            locale: 'en', // set locale
            fallbackLocale: 'en',
            messages: {
                en: removeEmpty({ COMPONENT: componentEN }),
                ko: removeEmpty({ COMPONENT: componentKO }),
                jp: removeEmpty({ COMPONENT: componentJA }),
            },
            silentFallbackWarn: true,
        });

        new _Vue({ i18n }).$mount(options?.appSelector || '#app');
    },
};

// Vue.use(SpaceoneDS);
// Object.keys(components).forEach((name) => {
//     Vue.component(name, components[name]);
// });

export default SpaceoneDS;


export { default as PBackToTopButton } from './atoms/back-to-top-button/PBackToTopButton.vue';
export { default as PBadge } from './atoms/badges/PBadge.vue';
export { default as PButton } from './atoms/buttons/PButton.vue';
export { default as PEmpty } from './atoms/empty/PEmpty.vue';
export { default as PHr } from './atoms/hr/PHr.vue';
export { default as PI } from './atoms/icons/PI.vue';
export { default as PTextInput } from './atoms/inputs/PTextInput.vue';
export { default as PLabel } from './atoms/labels/PLabel.vue';
export { default as PSkeleton } from './atoms/skeletons/PSkeleton.vue';
export { default as PCollapsibleToggle } from './atoms/collapsible-toggle/PCollapsibleToggle.vue';

export { default as PNoticeAlert } from './molecules/alert/notice/PNoticeAlert.vue';
export { default as PToastAlert } from './molecules/alert/toast/PToastAlert.vue';
export { default as PAnchor } from './molecules/anchors/PAnchor.vue';
export { default as PCopyButton } from './molecules/buttons/copy-button/PCopyButton.vue';
export { default as PIconButton } from './molecules/buttons/icon-button/PIconButton.vue';
export { default as PIconTextButton } from './molecules/buttons/icon-text-button/PIconTextButton.vue';
export { default as PLoadingButton } from './molecules/buttons/loading-button/PLoadingButton.vue';
export { default as PToggleButton } from './molecules/buttons/toggle-button/PToggleButton.vue';
export { default as PCardItem } from './molecules/cards/PCardItem.vue';
export { default as PCollapsiblePanel } from './molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';
export { default as PCheckBox } from './molecules/forms/checkbox/PCheckBox.vue';
export { default as PFieldGroup } from './molecules/forms/field-group/PFieldGroup.vue';
export { default as PRadio } from './molecules/forms/radio/PRadio.vue';
export { default as PGridLayout } from './molecules/layouts/grid-layout/PGridLayout.vue';
export { default as PPaneLayout } from './molecules/layouts/pane-layout/PPaneLayout.vue';
export { default as PSidebar } from './molecules/layouts/sidebar/PSidebar.vue';
export { default as PTextList } from './molecules/lists/text-list/PTextList.vue';
export { default as PLottie } from './molecules/lottie/PLottie.vue';
export { default as PMarkdown } from './molecules/markdown/PMarkdown.vue';
export { default as PModal } from './molecules/modals/PModal.vue';
export { default as PPageNavigation } from './molecules/page-navigation/PPageNavigation.vue';
export { default as PPanelTop } from './molecules/panel/panel-top/PPanelTop.vue';
export { default as PProgressBar } from './molecules/progress-bar/PProgressBar.vue';
export { default as PSearch } from './molecules/search/PSearch.vue';
export { default as PSelectableItem } from './molecules/selectable-item/PSelectableItem.vue';
export { default as PSelectBtnGroupSkeleton } from './molecules/skeletons/PSelectBtnGroupSkeleton.vue';
export { default as PStatus } from './molecules/status/PStatus.vue';
export { default as PProgressTabBar } from './molecules/tabs/progress-tab-bar/PProgressTabBar.vue';
export { default as PTabBar } from './molecules/tabs/tab-bar/PTabBar.vue';
export { default as PTag } from './molecules/tags/PTag.vue';
export { default as PTextEditor } from './molecules/text-editor/text-editor/PTextEditor.vue';
export { default as PTooltip } from './molecules/tooltips/PTooltip.vue';
export { default as PTreeNode } from './molecules/tree-node/PTreeNode.vue';

export { default as PSelectBtnGroup } from './organisms/buttons/select-btn-group/PSelectBtnGroup.vue';
export { default as PTooltipButton } from './organisms/buttons/tooltip-button/PTooltipButton.vue';
export { default as PChartLoader } from './organisms/charts/chart-loader/PChartLoader.vue';
export { default as PMetricChart } from './organisms/charts/metric-chart/PMetricChart.vue';
export { default as PContextMenu } from './organisms/context-menu/PContextMenu.vue';
export { default as PDatePagination } from './organisms/date-pagination/PDatePagination.vue';
export { default as PDefinition } from './organisms/definition/PDefinition.vue';
export { default as PDropdownBtn } from './organisms/dropdown/dropdown-btn/PDropdownBtn.vue';
export { default as PSelectDropdown } from './organisms/dropdown/select-dropdown/PSelectDropdown.vue';
export { default as PDropdownMenuBtn } from './organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
export { default as PDynamicField } from './organisms/dynamic-field/PDynamicField.vue';
export { default as PDynamicLayout } from './organisms/dynamic-layout/PDynamicLayout.vue';
export { default as PJsonSchemaForm } from './organisms/forms/json-schema-form/PJsonSchemaForm.vue';
export { default as PBoardLayout } from './organisms/layouts/board-layout/PBoardLayout.vue';
export { default as PHorizontalLayout } from './organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
export { default as PSearchGridLayout } from './organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
export { default as PToolboxGridLayout } from './organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';
export { default as PVerticalLayout } from './organisms/layouts/vertical-layout/PVerticalLayout.vue';
export { default as PWidgetLayout } from './organisms/layouts/widget-layout/PWidgetLayout.vue';
export { default as PLazyImg } from './organisms/lazy-img/PLazyImg.vue';
export { default as PSelectableList } from './organisms/lists/selectable-list/PSelectableList.vue';
export { default as PButtonModal } from './organisms/modals/button-modal/PButtonModal.vue';
export { default as PContentModal } from './organisms/modals/content-modal/PContentModal.vue';
export { default as PDoubleCheckModal } from './organisms/modals/double-check-modal/PDoubleCheckModal.vue';
export { default as PIconModal } from './organisms/modals/icon-modal/PIconModal.vue';
export { default as PTableCheckModal } from './organisms/modals/table-modal/PTableCheckModal.vue';
export { default as PPagination } from './organisms/paginations/pagination/PPagination.vue';
export { default as PTextPagination } from './organisms/paginations/text-pagination/PTextPagination.vue';
export { default as PRawData } from './organisms/raw-data/PRawData.vue';
export { default as PAutocompleteSearch } from './organisms/search/autocomplete-search/PAutocompleteSearch.vue';
export { default as PQuerySearch } from './organisms/search/query-search/PQuerySearch.vue';
export { default as PQuerySearchGuide } from './organisms/search/query-search-guide/PQuerySearchGuide.vue';
export { default as PQuerySearchTags } from './organisms/search/query-search-tags/PQuerySearchTags.vue';
export { default as PDataTable } from './organisms/tables/data-table/PDataTable.vue';
export { default as PDefinitionTable } from './organisms/tables/definition-table/PDefinitionTable.vue';
export { default as PQuerySearchTable } from './organisms/tables/query-search-table/PQuerySearchTable.vue';
export { default as PSearchTable } from './organisms/tables/search-table/PSearchTable.vue';
export { default as PToolboxTable } from './organisms/tables/toolbox-table/PToolboxTable.vue';
export { default as PButtonTab } from './organisms/tabs/button-tab/PButtonTab.vue';
export { default as PTab } from './organisms/tabs/tab/PTab.vue';
export { default as PPageTitle } from './organisms/title/page-title/PPageTitle.vue';
export { default as PTree } from './organisms/tree/PTree.vue';
export { default as PProgressWizard } from './organisms/wizards/progress-wizard/PProgressWizard.vue';

export { default as PNotificationBar } from './feedbacks/notification/PNotificationBar.vue';
