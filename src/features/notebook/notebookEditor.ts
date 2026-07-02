import type { Monaco } from "@monaco-editor/react";
import { useSetAtom, useStore } from "jotai";
import type { editor as MonacoEditor } from "monaco-editor";
import { useCallback, useEffect, useRef, type ComponentProps, type MutableRefObject } from "react";
import Editor from "@monaco-editor/react";
import { formatJavaScript } from "../formatter/format";
import type { RuntimeScopeVariable } from "../../runtime/types";
import {
  addCellAfterAtom,
  cellsAtom,
  notebookCommandsAtom,
  selectCellAtom,
  updateCellAtom,
} from "./state";

export type MountedEditor = Parameters<NonNullable<ComponentProps<typeof Editor>["onMount"]>>[0];

type Options = {
  editorRefs: MutableRefObject<Map<string, MountedEditor>>;
  runtimeScopeVariables: RuntimeScopeVariable[];
};

let apiTypesRegistration: Promise<void> | null = null;
let apiTypesRegistered = false;
let formatProviderRegistered = false;
let monacoThemeRegistered = false;

const RUNTIME_GLOBAL_TYPES = `
type TraqChannelWithFullPath = Traq.Channel & { fullPath: string };
declare const me: Traq.MyUserDetail | null;
declare const users: Traq.User[];
declare const channels: TraqChannelWithFullPath[];
declare const groups: Traq.UserGroup[];
`;
const RUNTIME_SCOPE_TYPES_PATH = "file:///traq-api-playground-runtime-scope.d.ts";
const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;

/**
 * Registers generated traQ declarations with Monaco once per page load. The
 * import is lazy because the declaration payload is large and only needed after
 * an editor mounts.
 */
const ensureApiTypes = (monaco: Monaco): void => {
  if (apiTypesRegistered) return;
  apiTypesRegistration ??= import("../../generated/traq-api-types").then(({ traqApiTypes }) => {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `${traqApiTypes}\n${RUNTIME_GLOBAL_TYPES}`,
      "file:///traq-api-playground.d.ts",
    );
    apiTypesRegistered = true;
  });
};

const configureMonaco = (monaco: Monaco): void => {
  if (!monacoThemeRegistered) {
    monaco.editor.defineTheme("github-dark-dimmed", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "adbac7", background: "22272e" },
        { token: "comment", foreground: "768390" },
        { token: "keyword", foreground: "f47067" },
        { token: "string", foreground: "96d0ff" },
        { token: "number", foreground: "6cb6ff" },
        { token: "type.identifier", foreground: "dcbdfb" },
      ],
      colors: {
        "editor.background": "#22272e",
        "editor.foreground": "#adbac7",
        "editorLineNumber.foreground": "#768390",
        "editorCursor.foreground": "#539bf5",
        "editor.selectionBackground": "#316dca66",
        "editor.inactiveSelectionBackground": "#316dca33",
        "editor.lineHighlightBackground": "#2d333b",
        "editorIndentGuide.background1": "#444c56",
        "editorIndentGuide.activeBackground1": "#768390",
        "scrollbarSlider.background": "#cdd9e533",
        "scrollbarSlider.hoverBackground": "#cdd9e54d",
        "scrollbarSlider.activeBackground": "#cdd9e566",
      },
    });
    monacoThemeRegistered = true;
  }

  const typescriptLanguage = monaco.languages.typescript as typeof monaco.languages.typescript & {
    ModuleDetectionKind?: { Force: number };
  };
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2022,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleDetection: typescriptLanguage.ModuleDetectionKind?.Force ?? 3,
    allowNonTsExtensions: true,
    strict: true,
    noEmitOnError: false,
  });
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1375, 1378],
  });
};

const cellIdFromEditor = (editor: MountedEditor, fallback: string): string => {
  const modelPath = editor.getModel()?.uri.path;
  const fileName = modelPath?.split("/").at(-1);
  return fileName?.endsWith(".ts") ? fileName.slice(0, -3) : fallback;
};

/**
 * Turns the worker's runtime-scope snapshot into ambient declarations so values
 * created in earlier cells get completion and type checking in later cells.
 */
const runtimeScopeTypes = (variables: RuntimeScopeVariable[]): string => {
  if (variables.length === 0) return "";
  return variables
    .filter(({ name }) => IDENTIFIER_PATTERN.test(name))
    .map(({ name, typeName }) => `declare const ${name}: ${typeName};`)
    .join("\n");
};

export const useNotebookEditors = ({ editorRefs, runtimeScopeVariables }: Options) => {
  const store = useStore();
  const monacoRef = useRef<Monaco | null>(null);
  const runtimeScopeVariablesRef = useRef(runtimeScopeVariables);
  const runtimeScopeTypesDisposableRef = useRef<{ dispose(): void } | null>(null);
  const addCellAfter = useSetAtom(addCellAfterAtom);
  const selectCell = useSetAtom(selectCellAtom);
  const updateCell = useSetAtom(updateCellAtom);

  const updateRuntimeScopeTypes = useCallback((variables: RuntimeScopeVariable[]) => {
    const monaco = monacoRef.current;
    if (!monaco) return;

    runtimeScopeTypesDisposableRef.current?.dispose();
    runtimeScopeTypesDisposableRef.current = null;

    const declarations = runtimeScopeTypes(variables);
    if (!declarations) return;

    runtimeScopeTypesDisposableRef.current =
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        declarations,
        RUNTIME_SCOPE_TYPES_PATH,
      );
  }, []);

  const beforeMount = useCallback((monaco: Monaco) => {
    configureMonaco(monaco);
  }, []);

  useEffect(() => {
    runtimeScopeVariablesRef.current = runtimeScopeVariables;
    updateRuntimeScopeTypes(runtimeScopeVariables);
  }, [runtimeScopeVariables, updateRuntimeScopeTypes]);

  const prepareCodeForRun = useCallback(
    /**
     * Emits Monaco's TypeScript model to JavaScript before sending it to the
     * worker. The trailing module marker is stripped because cells execute as
     * function bodies inside a scoped runtime, not as ES modules.
     */
    async (cellId: string, source: string): Promise<string> => {
      const editor = editorRefs.current.get(cellId);
      const model = editor?.getModel();
      const monaco = monacoRef.current;
      if (!model || !monaco) return source;

      const workerFactory = await monaco.languages.typescript.getTypeScriptWorker();
      const worker = await workerFactory(model.uri);
      const uri = model.uri.toString();
      const output = await worker.getEmitOutput(uri);
      const emitted = output.outputFiles[0]?.text;
      if (!emitted) return source;
      return emitted.replace(/\n?export\s*\{\};?\s*$/u, "");
    },
    [editorRefs, monacoRef],
  );

  const formatCell = useCallback(
    async (cellId: string) => {
      const editor = editorRefs.current.get(cellId);
      const current =
        editor?.getValue() ?? store.get(cellsAtom).find((cell) => cell.id === cellId)?.code;
      if (current === undefined) return;
      const formatted = await formatJavaScript(current);
      editor?.setValue(formatted);
      updateCell({ cellId, patch: { code: formatted } });
    },
    [editorRefs, store, updateCell],
  );

  const formatAllEditors = useCallback(async () => {
    await Promise.all(store.get(cellsAtom).map((cell) => formatCell(cell.id)));
  }, [formatCell, store]);

  const onEditorMount = useCallback(
    (cellId: string) => (editor: MountedEditor, monaco: Monaco) => {
      monacoRef.current = monaco;
      ensureApiTypes(monaco);
      updateRuntimeScopeTypes(runtimeScopeVariablesRef.current);
      editorRefs.current.set(cellId, editor);
      editor.onDidFocusEditorWidget(() => selectCell(cellIdFromEditor(editor, cellId)));

      if (!formatProviderRegistered) {
        monaco.languages.registerDocumentFormattingEditProvider("typescript", {
          async provideDocumentFormattingEdits(model: MonacoEditor.ITextModel) {
            const formatted = await formatJavaScript(model.getValue());
            return [{ range: model.getFullModelRange(), text: formatted }];
          },
        });
        formatProviderRegistered = true;
      }

      editor.onKeyDown((event) => {
        const mountedCellId = cellIdFromEditor(editor, cellId);
        const primary = event.ctrlKey || event.metaKey;
        const commands = store.get(notebookCommandsAtom);
        if (primary && event.shiftKey && event.keyCode === monaco.KeyCode.Enter) {
          event.preventDefault();
          event.stopPropagation();
          if (commands.canRun()) void commands.runAllCells();
        } else if (primary && event.keyCode === monaco.KeyCode.Enter) {
          event.preventDefault();
          event.stopPropagation();
          if (commands.canRun()) void commands.runCellById(mountedCellId);
        } else if (primary && event.keyCode === monaco.KeyCode.KeyB) {
          event.preventDefault();
          event.stopPropagation();
          addCellAfter(mountedCellId);
        } else if (primary && event.keyCode === monaco.KeyCode.KeyK) {
          event.preventDefault();
          event.stopPropagation();
          commands.toggleNetwork();
        } else if (primary && event.keyCode === monaco.KeyCode.KeyS) {
          event.preventDefault();
          event.stopPropagation();
          void formatCell(mountedCellId).finally(() => commands.saveNotebook(true));
        } else if (event.keyCode === monaco.KeyCode.Escape) {
          event.preventDefault();
          event.stopPropagation();
          commands.stopAll();
        }
      });
      editor.onDidDispose(() => editorRefs.current.delete(cellId));
    },
    [addCellAfter, editorRefs, formatCell, monacoRef, selectCell, store, updateRuntimeScopeTypes],
  );

  return {
    beforeMount,
    formatAllEditors,
    formatCell,
    onEditorMount,
    prepareCodeForRun,
  };
};
