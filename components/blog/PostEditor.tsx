"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { Placeholder } from "@tiptap/extensions";
import StudioBar from "@/components/blog/StudioBar";
import { postExtensions } from "@/lib/blog/extensions";
import { slugify } from "@/lib/blog/content";
import { uploadImage } from "@/lib/blog/upload";
import type { Post } from "@/lib/blog/types";
import { deletePost, publishPost, savePost, unpublishPost } from "@/app/studio/actions";

type SaveStatus = "saved" | "dirty" | "saving" | "error";

const AUTOSAVE_MS = 1500;

export default function PostEditor({ post }: { post: Post }) {
  const [title, setTitle] = useState(post.title);
  const [subtitle, setSubtitle] = useState(post.subtitle);
  const [cover, setCover] = useState(post.cover_image_url);
  const [published, setPublished] = useState(post.published);
  const [slug, setSlug] = useState(post.slug);

  const [status, setStatus] = useState<SaveStatus>("saved");
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  // Bumped on every edit; a save only marks "saved" if nothing changed meanwhile.
  const version = useRef(0);
  const [, forceTick] = useState(0);
  const markDirty = useCallback(() => {
    version.current += 1;
    setStatus("dirty");
    forceTick((n) => n + 1);
  }, []);

  const insertImageFile = useCallback(async (editor: Editor, file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const src = await uploadImage(file);
      editor.chain().focus().setImage({ src }).run();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      ...postExtensions,
      Placeholder.configure({ placeholder: "Tell your story…" }),
    ],
    content: post.content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: "post-body" },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (!file || !editorRef.current) return false;
        insertImageFile(editorRef.current, file);
        return true;
      },
      handleDrop: (_view, event) => {
        const file = Array.from(event.dataTransfer?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (!file || !editorRef.current) return false;
        event.preventDefault();
        insertImageFile(editorRef.current, file);
        return true;
      },
    },
    onUpdate: markDirty,
  });
  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  const save = useCallback(async () => {
    if (!editor) return;
    const savingVersion = version.current;
    setStatus("saving");
    const { error } = await savePost(post.id, {
      title,
      subtitle,
      cover_image_url: cover,
      content: editor.getJSON(),
    });
    if (error) {
      setStatus("error");
      setMessage(error);
    } else {
      setStatus(version.current === savingVersion ? "saved" : "dirty");
    }
  }, [editor, post.id, title, subtitle, cover]);

  // Drafts autosave. Live posts only change when "Update" is clicked, so
  // half-finished edits never reach readers.
  useEffect(() => {
    if (published || status !== "dirty") return;
    const timer = setTimeout(save, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [published, status, save, title, subtitle, cover]);

  useEffect(() => {
    if (status === "saved") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const [pending, setPending] = useState(false);
  async function run(task: () => Promise<void>) {
    setPending(true);
    try {
      await task();
    } finally {
      setPending(false);
    }
  }

  const handlePublish = (nextSlug: string) =>
    run(async () => {
      if (status !== "saved") await save();
      const { error } = await publishPost(post.id, nextSlug);
      if (error) return setMessage(error);
      setSlug(nextSlug);
      setPublished(true);
      setPublishOpen(false);
      setMessage(null);
    });

  const handleUnpublish = () =>
    run(async () => {
      const { error } = await unpublishPost(post.id);
      if (error) return setMessage(error);
      setPublished(false);
    });

  async function handleCover(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      setCover(await uploadImage(file));
      markDirty();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <StudioBar>
        <SaveIndicator status={uploading ? "uploading" : status} published={published} />
        {published && (
          <>
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="hidden text-neutral-400 hover:text-white sm:inline"
            >
              View
            </Link>
            <button
              onClick={handleUnpublish}
              disabled={pending}
              className="text-neutral-400 hover:text-white disabled:opacity-50"
            >
              Unpublish
            </button>
          </>
        )}
        {published ? (
          <button
            onClick={() => run(save)}
            disabled={pending || status === "saved" || status === "saving"}
            className="rounded-full bg-neon px-4 py-1.5 font-medium text-white transition-colors hover:bg-neon/80 disabled:opacity-40"
          >
            Update
          </button>
        ) : (
          <button
            onClick={() => setPublishOpen((o) => !o)}
            className="rounded-full bg-neon px-4 py-1.5 font-medium text-white transition-colors hover:bg-neon/80"
          >
            Publish
          </button>
        )}
      </StudioBar>

      {publishOpen && !published && (
        <PublishPanel
          initialSlug={slug.startsWith("draft-") ? slugify(title) : slug}
          pending={pending}
          onPublish={handlePublish}
          onCancel={() => setPublishOpen(false)}
        />
      )}

      {message && (
        <div className="mx-auto mt-6 max-w-[44rem] px-6">
          <p role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
            {message}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-[44rem] px-6 pb-40 pt-12">
        <CoverPicker
          cover={cover}
          onPick={handleCover}
          onRemove={() => {
            setCover(null);
            markDirty();
          }}
        />

        <AutoTextarea
          value={title}
          onChange={(v) => {
            setTitle(v);
            markDirty();
          }}
          placeholder="Title"
          className="mt-8 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
        />
        <AutoTextarea
          value={subtitle}
          onChange={(v) => {
            setSubtitle(v);
            markDirty();
          }}
          placeholder="Subtitle (optional)"
          className="mt-4 font-serif text-xl text-neutral-400 sm:text-2xl"
        />

        <div className="mt-10">
          {editor && <EditorMenus editor={editor} onImage={(f) => insertImageFile(editor, f)} />}
          <EditorContent editor={editor} />
        </div>

        <DeleteButton onDelete={() => deletePost(post.id)} />
      </div>
    </>
  );
}

function SaveIndicator({
  status,
  published,
}: {
  status: SaveStatus | "uploading";
  published: boolean;
}) {
  const label = {
    uploading: "Uploading image…",
    saving: "Saving…",
    error: "Save failed",
    dirty: published ? "Unpublished changes" : "Editing…",
    saved: published ? "Live" : "Draft saved",
  }[status];
  return (
    <span className={`hidden sm:inline ${status === "error" ? "text-ember" : "text-neutral-500"}`}>
      {label}
    </span>
  );
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
      className={`block w-full resize-none overflow-hidden bg-transparent text-white outline-none placeholder:text-neutral-700 ${className}`}
    />
  );
}

function CoverPicker({
  cover,
  onPick,
  onRemove,
}: {
  cover: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const picker = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onPick(file);
        e.target.value = "";
      }}
    />
  );

  if (!cover) {
    return (
      <button
        onClick={() => input.current?.click()}
        className="text-sm text-neutral-500 transition-colors hover:text-laser"
      >
        + Add cover image
        {picker}
      </button>
    );
  }

  return (
    <div className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt="" className="h-full w-full object-cover" />
      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => input.current?.click()}
          className="rounded-full bg-void/80 px-3 py-1 text-xs backdrop-blur hover:text-laser"
        >
          Replace
        </button>
        <button
          onClick={onRemove}
          className="rounded-full bg-void/80 px-3 py-1 text-xs backdrop-blur hover:text-ember"
        >
          Remove
        </button>
      </div>
      {picker}
    </div>
  );
}

function MenuButton({
  active,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-8 rounded px-2 py-1 text-sm transition-colors ${
        active ? "text-laser" : "text-neutral-300 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// Defined once, outside the component: the menus re-send their options to the
// editor whenever these change identity, and since the editor re-renders on
// every transaction, inline values would loop forever.
const bubbleShouldShow = ({ editor, from, to }: { editor: Editor; from: number; to: number }) =>
  from !== to && !editor.isActive("image");
const floatingOptions = { placement: "left", offset: 16 } as const;

function EditorMenus({ editor, onImage }: { editor: Editor; onImage: (file: File) => void }) {
  const [linkMode, setLinkMode] = useState(false);
  const [href, setHref] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function applyLink() {
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href.trim()) chain.setLink({ href: href.trim() }).run();
    else chain.unsetLink().run();
    setLinkMode(false);
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={bubbleShouldShow}
        className="z-50 flex items-center rounded-lg border border-neutral-800 bg-neutral-950 px-1 py-1 shadow-xl shadow-black/40"
      >
        {linkMode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyLink();
            }}
            className="flex items-center"
          >
            <input
              autoFocus
              value={href}
              onChange={(e) => setHref(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setLinkMode(false)}
              placeholder="Paste a link…"
              className="w-56 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-neutral-600"
            />
            <MenuButton label="Apply link" onClick={applyLink}>
              ↵
            </MenuButton>
          </form>
        ) : (
          <>
            <MenuButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <b>B</b>
            </MenuButton>
            <MenuButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <i className="font-serif">i</i>
            </MenuButton>
            <MenuButton
              label="Link"
              active={editor.isActive("link")}
              onClick={() => {
                setHref(editor.getAttributes("link").href ?? "");
                setLinkMode(true);
              }}
            >
              🔗
            </MenuButton>
            <span className="mx-1 h-5 w-px bg-neutral-800" />
            <MenuButton label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <span className="font-display font-bold">T</span>
            </MenuButton>
            <MenuButton label="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <span className="font-display text-xs font-bold">T</span>
            </MenuButton>
            <MenuButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <span className="font-serif text-lg leading-none">“</span>
            </MenuButton>
            <MenuButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
              <span className="font-mono text-xs">{"</>"}</span>
            </MenuButton>
          </>
        )}
      </BubbleMenu>

      <FloatingMenu
        editor={editor}
        className="relative z-50"
        options={floatingOptions}
      >
        <button
          type="button"
          aria-label="Insert"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setPlusOpen((o) => !o)}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-transform hover:border-white hover:text-white ${
            plusOpen ? "rotate-45" : ""
          }`}
        >
          +
        </button>
        {plusOpen && (
          <div className="absolute left-12 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5">
            <MenuButton label="Image" onClick={() => fileInput.current?.click()}>
              Image
            </MenuButton>
            <MenuButton
              label="Code block"
              onClick={() => {
                editor.chain().focus().toggleCodeBlock().run();
                setPlusOpen(false);
              }}
            >
              Code
            </MenuButton>
            <MenuButton
              label="List"
              onClick={() => {
                editor.chain().focus().toggleBulletList().run();
                setPlusOpen(false);
              }}
            >
              List
            </MenuButton>
            <MenuButton
              label="Divider"
              onClick={() => {
                editor.chain().focus().setHorizontalRule().run();
                setPlusOpen(false);
              }}
            >
              ―
            </MenuButton>
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImage(file);
            e.target.value = "";
            setPlusOpen(false);
          }}
        />
      </FloatingMenu>
    </>
  );
}

function PublishPanel({
  initialSlug,
  pending,
  onPublish,
  onCancel,
}: {
  initialSlug: string;
  pending: boolean;
  onPublish: (slug: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialSlug);
  return (
    <div className="border-b border-neutral-900 bg-neutral-950">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onPublish(value);
        }}
        className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-4 text-sm"
      >
        <label htmlFor="slug" className="text-neutral-400">
          URL
        </label>
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-neutral-800 px-3 py-2">
          <span className="text-neutral-600">/blog/</span>
          <input
            id="slug"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
        <button type="button" onClick={onCancel} className="text-neutral-500 hover:text-white">
          Cancel
        </button>
        <button
          disabled={pending || !value}
          className="rounded-full bg-laser px-4 py-1.5 font-medium text-void disabled:opacity-50"
        >
          {pending ? "Publishing…" : "Publish now"}
        </button>
      </form>
    </div>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <div className="mt-24 border-t border-neutral-900 pt-6 text-sm">
      {confirming ? (
        <span className="flex items-center gap-4">
          <span className="text-neutral-400">Delete this story permanently?</span>
          <button
            onClick={() => {
              setPending(true);
              onDelete().catch(() => setPending(false));
            }}
            disabled={pending}
            className="text-ember hover:underline disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Yes, delete"}
          </button>
          <button onClick={() => setConfirming(false)} className="text-neutral-500 hover:text-white">
            Cancel
          </button>
        </span>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-neutral-600 hover:text-ember">
          Delete story
        </button>
      )}
    </div>
  );
}
