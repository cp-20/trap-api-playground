import type { Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import {
  useCallback,
  useRef,
  type ComponentProps,
  type MutableRefObject,
} from "react";
import Editor from "@monaco-editor/react";
import { formatJavaScript } from "../format";
import type { NotebookCell } from "../types";

export type MountedEditor = Parameters<
  NonNullable<ComponentProps<typeof Editor>["onMount"]>
>[0];

type CommandRefs = {
  canRunRef: MutableRefObject<() => boolean>;
  runCellRef: MutableRefObject<(cellId: string) => void | Promise<void>>;
  runAllCellsRef: MutableRefObject<() => void | Promise<void>>;
  addCellAfterRef: MutableRefObject<(cellId: string) => void>;
  saveNotebookRef: MutableRefObject<(showToast?: boolean) => void>;
  stopAllRef: MutableRefObject<() => void>;
  toggleNetworkRef: MutableRefObject<() => void>;
};

type Options = {
  cellsRef: MutableRefObject<NotebookCell[]>;
  editorRefs: MutableRefObject<Map<string, MountedEditor>>;
  commands: CommandRefs;
  onSelectCell: (cellId: string) => void;
  onUpdateCell: (cellId: string, patch: Partial<NotebookCell>) => void;
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

function ensureApiTypes(monaco: Monaco): void {
  if (apiTypesRegistered) return;
  apiTypesRegistration ??= import("../generated/traq-api-types").then(
    ({ traqApiTypes }) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `${traqApiTypes}\n${RUNTIME_GLOBAL_TYPES}`,
        "file:///traq-api-playground.d.ts",
      );
      apiTypesRegistered = true;
    },
  );
}

function configureMonaco(monaco: Monaco): void {
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

  const typescriptLanguage = monaco.languages
    .typescript as typeof monaco.languages.typescript & {
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
}

function cellIdFromEditor(editor: MountedEditor, fallback: string): string {
  const modelPath = editor.getModel()?.uri.path;
  const fileName = modelPath?.split("/").at(-1);
  return fileName?.endsWith(".ts") ? fileName.slice(0, -3) : fallback;
}

export function useNotebookEditors({
  cellsRef,
  editorRefs,
  commands,
  onSelectCell,
  onUpdateCell,
}: Options) {
  const monacoRef = useRef<Monaco | null>(null);

  const beforeMount = useCallback((monaco: Monaco) => {
    configureMonaco(monaco);
  }, []);

  const prepareCodeForRun = useCallback(
    async (cellId: string, source: string): Promise<string> => {
      const editor = editorRefs.current.get(cellId);
      const model = editor?.getModel();
      const monaco = monacoRef.current;
      if (!model || !monaco) return source;

      const workerFactory =
        await monaco.languages.typescript.getTypeScriptWorker();
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
        editor?.getValue() ??
        cellsRef.current.find((cell) => cell.id === cellId)?.code;
      if (current === undefined) return;
      const formatted = await formatJavaScript(current);
      editor?.setValue(formatted);
      onUpdateCell(cellId, { code: formatted });
    },
    [cellsRef, editorRefs, onUpdateCell],
  );

  const formatAllEditors = useCallback(async () => {
    await Promise.all(cellsRef.current.map((cell) => formatCell(cell.id)));
  }, [cellsRef, formatCell]);

  const onEditorMount = useCallback(
    (cellId: string) => (editor: MountedEditor, monaco: Monaco) => {
      monacoRef.current = monaco;
      ensureApiTypes(monaco);
      editorRefs.current.set(cellId, editor);
      editor.onDidFocusEditorWidget(() =>
        onSelectCell(cellIdFromEditor(editor, cellId)),
      );

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
        if (
          primary &&
          event.shiftKey &&
          event.keyCode === monaco.KeyCode.Enter
        ) {
          event.preventDefault();
          event.stopPropagation();
          if (commands.canRunRef.current())
            void commands.runAllCellsRef.current();
        } else if (primary && event.keyCode === monaco.KeyCode.Enter) {
          event.preventDefault();
          event.stopPropagation();
          void commands.runCellRef.current(mountedCellId);
        } else if (primary && event.keyCode === monaco.KeyCode.KeyB) {
          event.preventDefault();
          event.stopPropagation();
          if (commands.canRunRef.current())
            commands.addCellAfterRef.current(mountedCellId);
        } else if (primary && event.keyCode === monaco.KeyCode.KeyK) {
          event.preventDefault();
          event.stopPropagation();
          commands.toggleNetworkRef.current();
        } else if (primary && event.keyCode === monaco.KeyCode.KeyS) {
          event.preventDefault();
          event.stopPropagation();
          void formatCell(mountedCellId).finally(() =>
            commands.saveNotebookRef.current(true),
          );
        } else if (event.keyCode === monaco.KeyCode.Escape) {
          event.preventDefault();
          event.stopPropagation();
          commands.stopAllRef.current();
        }
      });
      editor.onDidDispose(() => editorRefs.current.delete(cellId));
    },
    [commands, editorRefs, formatCell, monacoRef, onSelectCell],
  );

  return {
    beforeMount,
    formatAllEditors,
    formatCell,
    onEditorMount,
    prepareCodeForRun,
  };
}
