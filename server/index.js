import fs from "fs";
import path from "path";

import express from "express";
import cors from "cors";
import YAML from "yaml";

import { fileURLToPath } from "url";
import Parser from "rss-parser";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configDir = path.resolve(__dirname, "../config");
const keywordFile = path.join(configDir, "keywords.yaml");
const feedFile = path.join(configDir, "feeds.yaml");

const rssParser = new Parser();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());



function loadConfig() {
  return {
    keywords: YAML.parse(fs.readFileSync(keywordFile, "utf8")) || [],
    feeds: YAML.parse(fs.readFileSync(feedFile, "utf8")) || []
  };
}

let cache = {
  news: [],
  sensitive: []
};

// Utils
function snippet(text, max = 200) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
};

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};


// Feeds
async function fetchFeed(url) {
  try {
    const feed = await rssParser.parseURL(url);

    return feed.items.map(item => ({
      title: item.title || "",
      link: item.link || "",
      content: item.contentSnippet || item.content || "",
      source: url,
      preview: snippet(item.contentSnippet || item.content || "")
    }));
  } catch (err) {
    console.warn(`⚠️ RSS failed for ${url}: ${err.message}`);
    return [];
  }
};


async function refreshFeeds() {
  const { keywords, feeds } = loadConfig();

  const all = (await Promise.all(feeds.map(fetchFeed))).flat();

  const normalizedKeywords = keywords.map(k => normalize(k));

  const sensitive = all.filter(article => {
    const title = normalize(article.title);
    return normalizedKeywords.some(kw => title.includes(kw));
  });

  const news = all.filter(article => {
    const title = normalize(article.title);
    return !normalizedKeywords.some(kw => title.includes(kw));
  });

  cache = { news, sensitive };

  console.log(`📡 Loaded ${all.length} articles, ${sensitive.length} flagged, ${news.length} visible.`);
};


// API endpoints
app.get("/api/news", (req, res) => {
  res.json(cache.news);
});

app.get("/api/sensitive", (req, res) => {
  res.json(cache.sensitive);
});

app.get("/api/refresh", async (req, res) => {
  await refreshFeeds();
  res.json({ status: "refreshed", total: cache.news.length });
});

app.get("/api/article", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    console.log(`📰 Fetching article: ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FeedsReader/1.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const html = await response.text();

    const dom = new JSDOM(html, {
      url,
      contentType: "text/html",
      pretendToBeVisual: true
    });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return res.status(500).json({ error: "Could not parse article" });
    }

    // Remove heavy media, but don't touch punctuation in text
    let cleaned = article.content
      .replace(/<img[^>]*>/gi, "")
      .replace(/<picture[\s\S]*?<\/picture>/gi, "")
      .replace(/<figure[\s\S]*?<\/figure>/gi, "")
      .replace(/<video[\s\S]*?<\/video>/gi, "")
      .replace(/<svg[\s\S]*?<\/svg>/gi, "");

    res.json({
      url,
      title: article.title || "",
      html: cleaned,
      text: article.textContent || "",
      length: article.length || 0,
      excerpt: article.excerpt || ""
    });

  } catch (err) {
    console.error(`❌ Article parsing failed: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch or parse article" });
  }
});

// Start Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  await refreshFeeds();
});
