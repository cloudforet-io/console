cd ${DS_PATH} &&
echo "make DesignSystem link" &&
npm link &&
cd ${CONSOLE_PATH} &&
echo "link DesignSystem to Console" &&
npm link @spaceone/design-system
