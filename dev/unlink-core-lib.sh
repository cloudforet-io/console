cd ${CONSOLE_PATH} &&
echo "unlink ConsoleCoreLib from Console" &&
npm unlink --no-save @spaceone/console-core-lib &&
cd ${CORE_LIB_PATH} &&
echo "unlink ConsoleCoreLib"
npm unlink
