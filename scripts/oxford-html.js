/**
 * Parse README.md into Oxford-style resume HTML (Figma Oxford template).
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mdInline(s) {
  let html = escapeHtml(s);
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return html;
}

function sectionHeading(title) {
  return `<section class="ox-section">
  <h2 class="ox-heading">${escapeHtml(title)}</h2>`;
}

function entryRow(titleHtml, date) {
  const dateCell = date
    ? `<span class="entry__date">${escapeHtml(date)}</span>`
    : "";
  return `<div class="entry__row">
    <div class="entry__title">${titleHtml}</div>
    ${dateCell}
  </div>`;
}

function parseRoleDate(line) {
  const parts = line.split("·");
  if (parts.length < 2) return { role: line.trim(), date: "" };
  const date = parts[parts.length - 1].trim();
  const role = parts.slice(0, -1).join("·").trim();
  return { role: mdInline(role), date };
}

function parseExperienceBlock(text) {
  const lines = text.split("\n").filter((l) => l.trim() !== "" && l.trim() !== "---");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("- ")) {
      html += "<ul class=\"ox-list\">";
      while (i < lines.length && lines[i].startsWith("- ")) {
        html += `<li>${mdInline(lines[i].slice(2))}</li>`;
        i++;
      }
      html += "</ul>";
      continue;
    }

    if (/^\*\*[^*]+\*\*\s*—/.test(line)) {
      const org = mdInline(line);
      i++;
      let role = "";
      let date = "";
      if (i < lines.length && lines[i].startsWith("*")) {
        const parsed = parseRoleDate(lines[i]);
        role = parsed.role;
        date = parsed.date;
        i++;
      }
      const title = `${org}${role ? ` — ${role}` : ""}`;
      html += `<div class="entry entry--employer">${entryRow(title, date)}`;
      if (i < lines.length && lines[i].includes("](")) {
        html += `<p class="entry__links">${mdInline(lines[i])}</p>`;
        i++;
      }
      if (i < lines.length && lines[i].startsWith("- ")) {
        html += "<ul class=\"ox-list\">";
        while (i < lines.length && lines[i].startsWith("- ")) {
          html += `<li>${mdInline(lines[i].slice(2))}</li>`;
          i++;
        }
        html += "</ul>";
      }
      html += "</div>";
      continue;
    }

    if (/^\*\*[^*]+\*\*\s*·/.test(line)) {
      const title = mdInline(line);
      i++;
      let links = "";
      if (i < lines.length && lines[i].includes("](")) {
        links = `<p class="entry__links">${mdInline(lines[i])}</p>`;
        i++;
      }
      html += `<div class="entry entry--project">${entryRow(title, "")}${links}`;
      if (i < lines.length && lines[i].startsWith("- ")) {
        html += "<ul class=\"ox-list\">";
        while (i < lines.length && lines[i].startsWith("- ")) {
          html += `<li>${mdInline(lines[i].slice(2))}</li>`;
          i++;
        }
        html += "</ul>";
      }
      html += "</div>";
      continue;
    }

    if (line.includes("](")) {
      html += `<p class="entry__links">${mdInline(line)}</p>`;
      i++;
      continue;
    }

    html += `<p>${mdInline(line)}</p>`;
    i++;
  }

  return html;
}

function parseEducation(text) {
  const lines = text.split("\n").filter((l) => l.trim() && l.trim() !== "---");
  let html = "";
  let i = 0;
  while (i < lines.length) {
    if (/^\*\*[^*]+\*\*\s*—/.test(lines[i])) {
      const org = mdInline(lines[i]);
      i++;
      let subtitle = "";
      let date = "";
      if (i < lines.length && lines[i].startsWith("*")) {
        const parsed = parseRoleDate(lines[i]);
        subtitle = parsed.role;
        date = parsed.date;
        i++;
      }
      const title = `${org}${subtitle ? ` — ${subtitle}` : ""}`;
      html += `<div class="entry">${entryRow(title, date)}`;
      while (i < lines.length && !lines[i].startsWith("**")) {
        html += `<p class="entry__detail">${mdInline(lines[i])}</p>`;
        i++;
      }
      html += "</div>";
      continue;
    }
    i++;
  }
  return html;
}

function parseSkills(text) {
  const lines = text.split("\n").filter((l) => l.trim() && l.trim() !== "---");
  let html = '<div class="ox-skills">';
  for (const line of lines) {
    const m = line.match(/^\*\*([^*]+):\*\*\s*(.+)$/);
    if (m) {
      html += `<p><strong>${escapeHtml(m[1])}:</strong> ${mdInline(m[2])}</p>`;
    } else {
      html += `<p>${mdInline(line)}</p>`;
    }
  }
  html += "</div>";
  return html;
}

function parseCertifications(text) {
  const lines = text.split("\n").filter((l) => l.trim() && l.trim() !== "---");
  const headers = lines.filter((l) => !l.startsWith("- "));
  const bullets = lines.filter((l) => l.startsWith("- "));
  let html = "";
  for (const h of headers) {
    html += `<p class="entry__subtitle">${mdInline(h)}</p>`;
  }
  if (bullets.length) {
    html += '<ul class="ox-list ox-list--compact">';
    for (const b of bullets) {
      html += `<li>${mdInline(b.slice(2))}</li>`;
    }
    html += "</ul>";
  }
  return html;
}

function getSection(md, name) {
  const re = new RegExp(`## ${name}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`);
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

const CAREER_OBJECTIVE =
  "Senior Full Stack JavaScript Developer with 6+ years of experience delivering production web and mobile applications. React Native since 2019, with repeated Team Lead ownership across fintech, HR, analytics, and job-marketplace products. Focus on clear architecture, mentoring, and production-ready delivery.";

function buildOxfordResumeHtml(markdown) {
  const experience = getSection(markdown, "Experience");
  const education = getSection(markdown, "Education");
  const skills = getSection(markdown, "Skills");
  const certifications = getSection(markdown, "Certifications");
  const languages = getSection(markdown, "Languages");

  let body = "";

  body += sectionHeading("Career Objective");
  body += `<p class="ox-paragraph">${escapeHtml(CAREER_OBJECTIVE)}</p></section>`;

  body += sectionHeading("Relevant Experience");
  body += parseExperienceBlock(experience);
  body += "</section>";

  body += sectionHeading("Education");
  body += parseEducation(education);
  body += "</section>";

  body += sectionHeading("Additional Skills & Interests");
  body += parseSkills(skills);
  if (certifications) {
    body += `<p class="ox-subheading"><strong>Certifications</strong></p>`;
    body += parseCertifications(certifications);
  }
  if (languages) {
    body += `<p><strong>Languages:</strong> ${mdInline(languages.replace(/\n/g, " "))}</p>`;
  }
  body += "</section>";

  return body;
}

module.exports = { buildOxfordResumeHtml };
