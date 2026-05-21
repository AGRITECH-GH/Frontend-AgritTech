import { useEffect } from "react";

const DEFAULT_TITLE = "FarmBridge | Ghana Agri Marketplace";
const DEFAULT_DESCRIPTION =
  "FarmBridge connects farmers, buyers, and agents to trade agricultural products across Ghana.";

const resolveSiteOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const envOrigin = import.meta.env.VITE_SITE_URL;
  if (typeof envOrigin === "string" && envOrigin.trim()) {
    return envOrigin.replace(/\/$/, "");
  }
  return "";
};

const upsertMetaTag = (selector, attrName, attrValue, content) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const upsertCanonicalLink = (href) => {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export default function SeoMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = "/",
  robots = "index,follow",
  jsonLd,
}) {
  useEffect(() => {
    document.title = title;

    upsertMetaTag(
      'meta[name="description"]',
      "name",
      "description",
      description,
    );
    upsertMetaTag('meta[name="robots"]', "name", "robots", robots);
    upsertMetaTag('meta[property="og:title"]', "property", "og:title", title);
    upsertMetaTag(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description,
    );
    upsertMetaTag('meta[property="og:type"]', "property", "og:type", "website");
    upsertMetaTag(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card",
      "summary_large_image",
    );
    upsertMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMetaTag(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description,
    );

    const origin = resolveSiteOrigin();
    if (origin) {
      const normalizedPath = canonicalPath.startsWith("/")
        ? canonicalPath
        : `/${canonicalPath}`;
      const canonicalUrl = `${origin}${normalizedPath}`;
      upsertCanonicalLink(canonicalUrl);
      upsertMetaTag(
        'meta[property="og:url"]',
        "property",
        "og:url",
        canonicalUrl,
      );
    }

    const existingJsonLd = document.getElementById("seo-jsonld");
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "seo-jsonld";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, canonicalPath, robots, jsonLd]);

  return null;
}
