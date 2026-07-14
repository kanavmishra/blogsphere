import { useEffect } from "react";

function SEO({ title, description, keywords }) {
  useEffect(() => {
    // Update Document Title
    document.title = title ? `${title} | BlogSphere` : "BlogSphere | Developer Insights & Tech Tutorials";

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description || "BlogSphere is a developer-focused blogging platform featuring high-quality insights, tutorials, and real-time updates.";

    // Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords || "programming, tech blog, react, web development, ai, nextjs, developers, tutorial";
  }, [title, description, keywords]);

  return null;
}

export default SEO;
