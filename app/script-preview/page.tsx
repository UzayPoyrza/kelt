"use client";

import { useEffect, useState } from "react";

export default function ScriptPreviewPage() {
  const [script, setScript] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("script-preview");
    if (raw) setScript(raw);
  }, []);

  return (
    <pre
      style={{
        fontFamily: "monospace",
        fontSize: "14px",
        lineHeight: "1.8",
        padding: "40px",
        whiteSpace: "pre-wrap",
        background: "#faf9f7",
        color: "#1a1614",
        minHeight: "100vh",
        margin: 0,
      }}
    >
      {script || "No script data found."}
    </pre>
  );
}
