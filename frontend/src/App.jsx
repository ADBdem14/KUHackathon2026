import { useMemo, useState } from "react";
import Chat from "./Chat";
import "./App.css";

const initialUsers = [
  {
    id: 1,
    name: "Aaron",
    skills: "React, Node, UI",
    role: "Looking to Help",
    note: "Frontend engineer who likes polishing demos fast.",
  },
  {
    id: 2,
    name: "Alex",
    skills: "Python, AI, APIs",
    role: "Need Help",
    note: "Needs a frontend partner for an AI teammate experience.",
  },
];

const initialProjects = [
  {
    id: 1,
    title: "Build a React App",
    skills: "React, CSS, UI",
    type: "Need Help",
    summary: "Landing the frontend and presentation polish.",
  },
  {
    id: 2,
    title: "AI Chatbot",
    skills: "Node, APIs, AI",
    type: "Looking to Help",
    summary: "Can support backend glue and demo coaching copy.",
  },
];

const initialComments = [
  {
    id: 1,
    author: "TeamUp AI",
    text: "Post a profile, add a project, then run a match to simulate a collaborator handoff.",
  },
];

const emptyProfile = {
  name: "",
  skills: "",
  role: "Looking to Help",
  note: "",
};

const emptyProject = {
  title: "",
  skills: "",
  type: "Need Help",
  summary: "",
};

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function UserCard({ user }) {
  return (
    <article className="card">
      <div className="card-topline">
        <h3>{user.name}</h3>
        <span className={`status-chip ${user.role === "Looking to Help" ? "helping" : "needs-help"}`}>
          {user.role}
        </span>
      </div>
      <p className="card-skills">{user.skills}</p>
      <p className="card-copy">{user.note}</p>
    </article>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="card">
      <div className="card-topline">
        <h3>{project.title}</h3>
        <span className={`status-chip ${project.type === "Looking to Help" ? "helping" : "needs-help"}`}>
          {project.type}
        </span>
      </div>
      <p className="card-skills">{project.skills}</p>
      <p className="card-copy">{project.summary}</p>
    </article>
  );
}

function MatchCard({ match, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={`match-card ${isActive ? "active" : ""}`}
      onClick={() => onSelect(match)}
    >
      <div className="match-title">
        <strong>{match.user.name}</strong>
        <span>with</span>
        <strong>{match.project.title}</strong>
      </div>
      <p>{match.summary}</p>
      <div className="match-meta">
        <span>Shared skills: {match.common.join(", ") || "none"}</span>
        <span>Match score: {match.score}</span>
      </div>
    </button>
  );
}

const apiBase = "/api";

export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [projects, setProjects] = useState(initialProjects);
  const [comments, setComments] = useState(initialComments);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [commentText, setCommentText] = useState("");
  const [matches, setMatches] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState("");

  const dashboardStats = useMemo(() => {
    const helperCount = users.filter((user) => user.role === "Looking to Help").length;
    const needsHelpCount = users.length - helperCount;

    return [
      { label: "Profiles", value: users.length },
      { label: "Projects", value: projects.length },
      { label: "Helpers", value: helperCount },
      { label: "Need Help", value: needsHelpCount },
    ];
  }, [projects.length, users]);

  const addProfile = (event) => {
    event.preventDefault();

    const newProfile = {
      ...profileForm,
      id: Date.now(),
      skills: profileForm.skills.trim(),
      note: profileForm.note.trim() || "Open to collaboration during the demo.",
    };

    setUsers((current) => [newProfile, ...current]);
    setComments((current) => [
      {
        id: Date.now() + 1,
        author: "System",
        text: `${newProfile.name} joined the workspace as ${newProfile.role.toLowerCase()}.`,
      },
      ...current,
    ]);
    setProfileForm(emptyProfile);
  };

  const addProject = (event) => {
    event.preventDefault();

    const newProject = {
      ...projectForm,
      id: Date.now(),
      skills: projectForm.skills.trim(),
      summary: projectForm.summary.trim() || "Ready for hackathon pairing and feedback.",
    };

    setProjects((current) => [newProject, ...current]);
    setComments((current) => [
      {
        id: Date.now() + 2,
        author: "System",
        text: `Project posted: ${newProject.title}.`,
      },
      ...current,
    ]);
    setProjectForm(emptyProject);
  };

  const addComment = (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    setComments((current) => [
      {
        id: Date.now(),
        author: "Demo Note",
        text: commentText.trim(),
      },
      ...current,
    ]);
    setCommentText("");
  };

  const runMatching = async () => {
    setLoadingMatches(true);
    setMatchError("");

    try {
      const response = await fetch(`${apiBase}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users, projects }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate matches");
      }

      const data = await response.json();
      setMatches(data.matches ?? []);
      setActiveChat((current) => current ?? data.matches?.[0] ?? null);
    } catch (error) {
      setMatchError(error.message || "Something went wrong while matching.");
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Hackathon Demo Workspace</p>
          <h1>TeamUp AI</h1>
          <p className="hero-copy">
            Match people to projects, collect feedback, and run a guided fake AI discussion that feels live during a demo.
          </p>
        </div>
        <div className="stats-grid">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <main className="workspace-grid">
        <div className="workspace-column">
          <Panel title="Create Profile" subtitle="Add a teammate with skills and a quick collaboration note.">
            <form className="form-stack" onSubmit={addProfile}>
              <input
                placeholder="Name"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
              <input
                placeholder="Skills: React, APIs, AI"
                value={profileForm.skills}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, skills: event.target.value }))
                }
                required
              />
              <select
                value={profileForm.role}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, role: event.target.value }))
                }
              >
                <option>Looking to Help</option>
                <option>Need Help</option>
              </select>
              <textarea
                placeholder="Quick note about what this person can contribute"
                value={profileForm.note}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, note: event.target.value }))
                }
                rows={3}
              />
              <button type="submit" className="primary-button">
                Add Profile
              </button>
            </form>
          </Panel>

          <Panel title="People" subtitle="Current collaborators in the room.">
            <div className="card-grid">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </Panel>

          <Panel title="Post Project" subtitle="Capture the build need and what skills the team wants.">
            <form className="form-stack" onSubmit={addProject}>
              <input
                placeholder="Project title"
                value={projectForm.title}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
              <input
                placeholder="Skills: React, Node, Pitching"
                value={projectForm.skills}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, skills: event.target.value }))
                }
                required
              />
              <select
                value={projectForm.type}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, type: event.target.value }))
                }
              >
                <option>Need Help</option>
                <option>Looking to Help</option>
              </select>
              <textarea
                placeholder="What is the project trying to ship?"
                value={projectForm.summary}
                onChange={(event) =>
                  setProjectForm((current) => ({ ...current, summary: event.target.value }))
                }
                rows={3}
              />
              <button type="submit" className="primary-button">
                Post Project
              </button>
            </form>
          </Panel>

          <Panel title="Projects" subtitle="Open projects that can be matched with profiles.">
            <div className="card-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Panel>
        </div>

        <div className="workspace-column">
          <Panel title="AI Matchmaker" subtitle="Generate suggested pairings and pick one to open the live chat.">
            <div className="actions-row">
              <button type="button" className="accent-button" onClick={runMatching} disabled={loadingMatches}>
                {loadingMatches ? "Finding matches..." : "Find Matches"}
              </button>
              {matchError ? <p className="error-text">{matchError}</p> : null}
            </div>

            <div className="match-list">
              {matches.length === 0 ? (
                <div className="empty-state">
                  <strong>No matches yet.</strong>
                  <p>Run the matchmaker after adding a few profiles and projects.</p>
                </div>
              ) : (
                matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isActive={activeChat?.id === match.id}
                    onSelect={setActiveChat}
                  />
                ))
              )}
            </div>
          </Panel>

          <Panel title="Demo Notes" subtitle="Drop comments you can mention during the walkthrough.">
            <form className="comment-form" onSubmit={addComment}>
              <input
                placeholder="Example: Judges loved the teammate handoff flow."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />
              <button type="submit" className="secondary-button">
                Add Comment
              </button>
            </form>

            <div className="comment-list">
              {comments.map((comment) => (
                <article key={comment.id} className="comment-card">
                  <strong>{comment.author}</strong>
                  <p>{comment.text}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Chat activeChat={activeChat} onCommentGenerated={(text) => {
            setComments((current) => [
              {
                id: Date.now(),
                author: "AI Coach",
                text,
              },
              ...current,
            ]);
          }} />
        </div>
      </main>
    </div>
  );
}
