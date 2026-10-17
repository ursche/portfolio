import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

/**
 * Schema shared by the editor (client) and the static HTML renderer
 * (server), so whatever can be written can also be rendered.
 */
export const postExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    },
  }),
  Image.configure({ HTMLAttributes: { loading: "lazy" } }),
];
