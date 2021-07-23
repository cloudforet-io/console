cd ${CONSOLE_PATH} &&
echo "unlink ConsoleCoreLib from Console" &&
npm unlink --no-save @spaceone/console-core-lib &&
cd ${CORE_LIB_PATH} &&
cd dist &&
rimraf package.json &&
cd .. &&
echo "unlink ConsoleCoreLib" &&
npm unlink
