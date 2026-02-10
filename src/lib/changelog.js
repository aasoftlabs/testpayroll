import fs from "fs";
import path from "path";

export async function getReleases() {
  const filePath = path.join(process.cwd(), "CHANGELOG.md");
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Split by version headers (## [v...)
  // Regex looks for: ## [vX.Y.Z] - YYYY-MM-DD
  const versionRegex = /^## \[(v[^\]]+)\] - (\d{4}-\d{2}-\d{2})/gm;

  const releases = [];
  let match;

  // We need to find all matches to slice the content between them
  const matches = [];
  while ((match = versionRegex.exec(fileContent)) !== null) {
    matches.push({
      version: match[1],
      date: match[2],
      index: match.index,
      fullMatch: match[0],
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    // Extract content block for this version
    const start = current.index + current.fullMatch.length;
    const end = next ? next.index : fileContent.length;
    const content = fileContent.slice(start, end).trim();

    releases.push({
      version: current.version,
      date: current.date,
      tag: i === 0 ? "LATEST" : i === matches.length - 1 ? "STABLE" : "", // Simple auto-tagging
      ...parseContent(content),
    });
  }

  return releases;
}

function parseContent(content) {
  const sections = {
    improvements: [],
    fixes: [],
    patches: [],
  };

  const lines = content.split("\n");
  let currentSection = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("### Improvements")) {
      currentSection = "improvements";
    } else if (line.startsWith("### Fixes")) {
      currentSection = "fixes";
    } else if (line.startsWith("### Patches")) {
      currentSection = "patches";
    } else if (line.startsWith("- ")) {
      if (currentSection) {
        sections[currentSection].push(line.substring(2)); // Remove "- "
      }
    }
  }

  return sections;
}
