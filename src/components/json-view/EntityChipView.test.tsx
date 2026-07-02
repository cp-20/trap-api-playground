import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntityChipView } from "./EntityChipView";

describe("EntityChipView", () => {
  it("prefixes group chips with @", () => {
    render(
      <EntityChipView
        chip={{
          kind: "group",
          id: "group-id",
          label: "sysad",
          detail: {},
        }}
      />,
    );

    expect(screen.getByText("@sysad")).toBeInTheDocument();
  });

  it("keeps existing prefixes for channel and stamp chips", () => {
    render(
      <>
        <EntityChipView
          chip={{
            kind: "channel",
            id: "channel-id",
            label: "general",
            fullPath: "general",
            detail: {},
          }}
        />
        <EntityChipView
          chip={{
            kind: "stamp",
            id: "stamp-id",
            name: "blob",
            label: "blob",
            imageUrl: "/stamp.webp",
            detail: {},
          }}
        />
      </>,
    );

    expect(screen.getByText("#general")).toBeInTheDocument();
    expect(screen.getByText(":blob")).toBeInTheDocument();
  });
});
