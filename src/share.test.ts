import { describe, expect, it } from "vitest";
import { decodeShare, encodeShare } from "./share";
import type { NotebookSnapshot } from "./features/notebook/types";

describe("share encoding", () => {
  it("round-trips notebooks without token fields", () => {
    const snapshot: NotebookSnapshot = {
      version: 1,
      selectedCellId: "cell-1",
      layout: { networkOpen: false },
      cells: [
        {
          id: "cell-1",
          title: "Cell",
          code: "return await api.getMe();",
          readOnly: true,
        },
      ],
    };

    const encoded = encodeShare(snapshot);

    expect(encoded).toContain("#share=");
    expect(encoded).not.toContain("token");
    expect(decodeShare(encoded)).toEqual(snapshot);
  });
});
