cd ${CONSOLE_PATH} &&
echo "unlink Mirinae from Console" &&
npm unlink --no-save @spaceone/design-system &&
cd ${MIRINAE_PATH} &&
echo "unlink Mirinae"
npm unlink ${MIRINAE_PATH}
