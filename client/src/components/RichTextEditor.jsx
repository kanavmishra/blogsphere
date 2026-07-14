import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

function RichTextEditor({ value, onChange, placeholder, onTitleSuggest }) {
  const [previewMode, setPreviewMode] = useState("edit"); // 'edit', 'preview', 'split'
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState("");

  const insertText = (before, after = "") => {
    const textarea = document.getElementById("markdown-editor-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    onChange({
      target: {
        name: "content",
        value: text.substring(0, start) + replacement + text.substring(end),
      },
    });

    // Re-focus and position cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleAiAction = async (type) => {
    if (!aiPrompt && type !== "improve") {
      toast.warn("Please enter a topic or instruction in the AI input");
      return;
    }

    setAiLoading(true);
    setAiSuggestions("");
    try {
      const res = await API.post("/ai/suggest", {
        prompt: aiPrompt || "Improve clarity and professionalism",
        type,
        currentContent: value,
      });

      if (res.data.suggestion) {
        setAiSuggestions(res.data.suggestion);
        toast.success("AI suggestion generated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (!aiSuggestions) return;
    onChange({
      target: {
        name: "content",
        value: value ? `${value}\n\n${aiSuggestions}` : aiSuggestions,
      },
    });
    setAiSuggestions("");
    setAiPrompt("");
  };

  return (
    <div className="border border-brand-border rounded-2xl overflow-hidden bg-brand-card shadow-sm">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-brand-bg border-b border-brand-border">
        {/* Formatting actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => insertText("**", "**")}
            className="p-2 hover:bg-brand-border rounded-lg text-sm font-bold text-brand-muted hover:text-brand-text transition cursor-pointer"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertText("*", "*")}
            className="p-2 hover:bg-brand-border rounded-lg text-sm italic text-brand-muted hover:text-brand-text transition cursor-pointer"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertText("## ")}
            className="p-2 hover:bg-brand-border rounded-lg text-xs font-bold text-brand-muted hover:text-brand-text transition cursor-pointer"
            title="Header 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertText("### ")}
            className="p-2 hover:bg-brand-border rounded-lg text-xs font-bold text-brand-muted hover:text-brand-text transition cursor-pointer"
            title="Header 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertText("[", "](url)")}
            className="p-2 hover:bg-brand-border rounded-lg text-sm text-brand-muted hover:text-brand-text transition cursor-pointer"
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => insertText("```\n", "\n```")}
            className="p-2 hover:bg-brand-border rounded-lg text-sm text-brand-muted hover:text-brand-text transition cursor-pointer"
            title="Code Block"
          >
            💻
          </button>
          <button
            type="button"
            onClick={() => insertText("- ")}
            className="p-2 hover:bg-brand-border rounded-lg text-sm text-brand-muted hover:text-brand-text transition cursor-pointer"
            title="List"
          >
            📝
          </button>
        </div>

        {/* View selector */}
        <div className="flex bg-brand-bg border border-brand-border rounded-lg p-0.5">
          {["edit", "preview", "split"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition cursor-pointer ${
                previewMode === mode
                  ? "bg-purple-primary text-white"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistant Sub-bar */}
      <div className="p-4 bg-purple-lilac/10 border-b border-brand-border flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Type your topic/request (e.g. 'Build a React Hook tutorial' or 'Make outline for Git workflow')..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 bg-brand-bg text-brand-text placeholder-brand-muted/60 border border-brand-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-primary"
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => handleAiAction("outline")}
              disabled={aiLoading}
              className="px-4 py-2.5 bg-purple-primary hover:bg-purple-primary/95 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              ✨ Outline
            </button>
            <button
              type="button"
              onClick={() => handleAiAction("title")}
              disabled={aiLoading}
              className="px-4 py-2.5 bg-rose-gold text-purple-deep rounded-xl text-[10px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              💡 Title
            </button>
            <button
              type="button"
              onClick={() => handleAiAction("improve")}
              disabled={aiLoading || !value}
              className="px-4 py-2.5 bg-purple-lilac/30 border border-purple-lilac/60 text-purple-deep rounded-xl text-[10px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
              title="Enhance written draft quality"
            >
              ✍️ Improve
            </button>
          </div>
        </div>

        {/* AI Output box */}
        {aiLoading && (
          <div className="text-xs text-purple-primary animate-pulse flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 bg-purple-primary rounded-full animate-ping"></span>
            AI Writing Assistant is generating suggestions...
          </div>
        )}

        {aiSuggestions && (
          <div className="bg-brand-bg rounded-xl border border-purple-lilac/60 p-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-bold text-purple-deep bg-purple-lilac/30 border border-purple-lilac/60 px-2 py-0.5 rounded-full">
                AI Suggestion
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplySuggestion}
                  className="bg-purple-primary hover:bg-purple-primary/90 text-white px-3 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                >
                  Insert Content
                </button>
                {onTitleSuggest && aiPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      // Call callback with suggestions so they can pick a title
                      onTitleSuggest(aiSuggestions);
                      setAiSuggestions("");
                      setAiPrompt("");
                    }}
                    className="bg-rose-gold text-purple-deep px-3 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                  >
                    Use as Title Suggestion
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setAiSuggestions("")}
                  className="text-brand-muted hover:text-brand-text text-[10px] font-semibold px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <pre className="text-xs text-brand-text whitespace-pre-wrap font-mono leading-relaxed bg-brand-card p-3 rounded-lg border border-brand-border max-h-48 overflow-y-auto">
              {aiSuggestions}
            </pre>
          </div>
        )}
      </div>

      {/* Editor Body */}
      <div className={`grid ${previewMode === "split" ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {(previewMode === "edit" || previewMode === "split") && (
          <textarea
            id="markdown-editor-textarea"
            rows="14"
            placeholder={placeholder || "Write your article using markdown formatting..."}
            value={value}
            onChange={onChange}
            name="content"
            className="w-full bg-transparent text-brand-text placeholder-brand-muted/50 p-5 focus:outline-none font-mono text-sm leading-relaxed border-r border-brand-border/30 resize-none min-h-[350px]"
          ></textarea>
        )}

        {(previewMode === "preview" || previewMode === "split") && (
          <div className="p-6 min-h-[350px] bg-brand-bg/30 text-brand-text font-serif text-base leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[500px]">
            {value ? (
              value
            ) : (
              <span className="text-brand-muted/70 italic text-sm">
                Live Markdown Preview...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RichTextEditor;
