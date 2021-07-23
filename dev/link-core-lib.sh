cd ${CORE_LIB_PATH} &&
cp -r package.json dist &&
cd dist &&
echo "make ConsoleCoreLib link" &&
npm link &&
cd ${CONSOLE_PATH} &&
echo "link ConsoleCoreLib to Console" &&
npm link @spaceone/console-core-lib
