cd ${DS_PATH} &&
echo "make DesignSystem link" &&
npm link &&
cd ${CORE_LIB_PATH} &&
echo "link DesignSystem to ConsoleCoreLib" &&
npm link @spaceone/design-system
