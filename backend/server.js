const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function normalizeSkills(value = "") {
  return value
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}

function titleCase(skill) {
  return skill
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildMatches(users = [], projects = []) {
  const matches = [];

  users.forEach((user) => {
    const userSkills = normalizeSkills(user.skills);

    projects.forEach((project) => {
      const projectSkills = normalizeSkills(project.skills);
      const common = userSkills.filter((skill) => projectSkills.includes(skill));
      const roleBonus = user.role === "Looking to Help" && project.type === "Need Help" ? 20 : 10;
      const score = common.length * 30 + roleBonus;

      if (score <= 10) {
        return;
      }

      matches.push({
        id: `${user.id}-${project.id}`,
        user: {
          name: user.name,
          role: user.role,
          skills: user.skills,
          note: user.note,
        },
        project: {
          title: project.title,
          type: project.type,
          skills: project.skills,
          summary: project.summary,
        },
        common: common.map(titleCase),
        score,
        summary:
          common.length > 0
            ? `${user.name} can support ${project.title} with ${common.map(titleCase).join(", ")}.`
            : `${user.name} has complementary experience that can still unblock ${project.title}.`,
      });
    });
  });

  return matches.sort((a, b) => b.score - a.score).slice(0, 6);
}

function buildChatReply(message, context) {
  const lower = message.toLowerCase();
  const sharedSkills = context?.common?.length ? context.common.join(", ") : "their complementary skills";
  const userName = context?.user?.name || "this teammate";
  const projectTitle = context?.project?.title || "the project";

  let reply = `I would position ${userName} as the person who can unblock ${projectTitle} first, then keep the scope tight around a clear MVP.`;
  let commentary = `${userName} is a strong demo partner for ${projectTitle}.`;

  if (lower.includes("frontend") || lower.includes("ui")) {
    reply = `${userName} should own the UI pass and keep the interface focused on one smooth workflow. Shared strengths here are ${sharedSkills}.`;
    commentary = `The UI story is cleanest when ${userName} leads the frontend and the team narrates one polished user flow.`;
  } else if (lower.includes("mvp") || lower.includes("judge")) {
    reply = `For judges, show profile creation, project posting, one smart match, then a guided AI discussion. That sequence makes the value obvious in under a minute.`;
    commentary = `Best judge path: create profile, post project, match teammates, open AI discussion.`;
  } else if (lower.includes("roles") || lower.includes("divide")) {
    reply = `Split the work into three lanes: one person drives UI, one person handles backend responses, and one person owns the pitch and live narration.`;
    commentary = `Clear role split helps the demo feel calm and intentional.`;
  } else if (lower.includes("api") || lower.includes("backend")) {
    reply = `Keep the backend lightweight: matching and chat replies should feel deterministic so the demo stays stable even under pressure.`;
    commentary = `Stable fake AI beats fragile real AI in a live hackathon demo.`;
  } else if (lower.includes("skills") || lower.includes("match")) {
    reply = `${projectTitle} should prioritize teammates with ${sharedSkills}. That gives you an easy explanation for why the match was chosen.`;
    commentary = `Explain the match using shared skills so judges instantly see the logic.`;
  }

  return { reply, commentary };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

app.post("/api/match", (req, res) => {
  const { users = [], projects = [] } = req.body;
  const matches = buildMatches(users, projects);

  res.json({ matches });
});

app.post("/api/chat", (req, res) => {
  const { message = "", context = null } = req.body;

  if (!message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  const { reply, commentary } = buildChatReply(message, context);
  return res.json({ reply, commentary });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
