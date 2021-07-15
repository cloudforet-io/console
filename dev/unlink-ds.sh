cd ${CONSOLE_PATH} &&
echo "unlink DesignSystem from Console" &&
npm unlink --no-save @spaceone/design-system &&
cd ${DS_PATH} &&
echo "unlink DesignSystem"
npm unlink
