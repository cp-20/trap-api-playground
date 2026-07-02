export const formatJavaScript = async (code: string): Promise<string> => {
  const [{ default: prettier }, babelPlugin, estreePlugin] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/typescript"),
    import("prettier/plugins/estree"),
  ]);

  return prettier.format(code, {
    parser: "typescript",
    plugins: [babelPlugin, estreePlugin],
    semi: false,
    trailingComma: "all",
  });
};
