cd ${CORE_LIB_PATH} &&
echo "unlink DesignSystem from ConsoleCoreLib" &&
npm unlink --no-save @spaceone/design-system &&
cd ${DS_PATH} &&
echo "unlink DesignSystem"
npm unlink
