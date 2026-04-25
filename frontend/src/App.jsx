import { useState } from "react";
import Chat from "./Chat";
import "./App.css";

// Reusable Card Component
const Card = ({ title, skills, type, onClick }) => (
  <div className="card clickable" onClick={onClick}>
    <h3>{title}</h3>
    <p><strong>Skills:</strong> {skills}</p>
    <span className="tag">{type}</span>
  </div>
);

// Reusable Form Component
const Form = ({ formData, setFormData, onSubmit, options, placeholders }) => (
  <form onSubmit={onSubmit} className="form">
    <input
      placeholder={placeholders.title}
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      required
    />
    <input
      placeholder={placeholders.skills}
      value={formData.skills}
      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
      required
    />
    <select
      value={formData.type}
      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
    >
      {options.map((option, index) => (
        <option key={index}>{option}</option>
      ))}
    </select>
    <button type="submit">{placeholders.buttonText}</button>
  </form>
);

export default function App() {
  const [users, setUsers] = useState([
    { name: "Aaron", skills: "React, Node", role: "Looking to Help" },
    { name: "Alex", skills: "Python, AI", role: "Need Help" },
  ]);

  const [userForm, setUserForm] = useState({
    name: "",
    skills: "",
    role: "Looking to Help",
  });

  const [activeChat, setActiveChat] = useState(null);

  const [projects, setProjects] = useState([
    { title: "Build a React App", skills: "React, CSS", type: "Need Help" },
    { title: "AI Chatbot", skills: "Node.js, API", type: "Looking to Help" },
  ]);

  const [form, setForm] = useState({
    title: "",
    skills: "",
    type: "Need Help",
  });

  const [matches, setMatches] = useState([]);

  const findMatches = () => {
    const results = [];

    for (let i = 0; i < projects.length; i++) {
      for (let j = i + 1; j < projects.length; j++) {
        const skillsA = projects[i].skills.toLowerCase().split(",");
        const skillsB = projects[j].skills.toLowerCase().split(",");

        const overlap = skillsA.filter((skill) =>
          skillsB.includes(skill.trim())
        );

        if (overlap.length > 0) {
          results.push({
            a: projects[i].title,
            b: projects[j].title,
            common: overlap,
            score: overlap.length * 25,
          });
        }
      }
    }

    return results;
  };

  return (
    <>
      <h2>👤 Create Profile</h2>
      <Form
        formData={userForm}
        setFormData={setUserForm}
        onSubmit={(e) => {
          e.preventDefault();
          setUsers([...users, userForm]);
          setUserForm({ name: "", skills: "", role: "Looking to Help" });
        }}
        options={["Looking to Help", "Need Help"]}
        placeholders={{
          title: "Name",
          skills: "Skills (React, Python...)",
          buttonText: "Create",
        }}
      />

      <div className="projects">
        {users.map((u, i) => (
          <Card
            key={i}
            title={u.name}
            skills={u.skills}
            type={u.role}
          />
        ))}
      </div>

      <div className="container">
        <h1>🤝 TeamUp AI</h1>
        <p className="subtitle">
          Find collaborators. Build projects. Powered by AI.
        </p>

        <Form
          formData={form}
          setFormData={setForm}
          onSubmit={(e) => {
            e.preventDefault();
            setProjects([...projects, form]);
            setForm({ title: "", skills: "", type: "Need Help" });
          }}
          options={["Need Help", "Looking to Help"]}
          placeholders={{
            title: "Project Title",
            skills: "Skills (e.g. React, Python)",
            buttonText: "Post",
          }}
        />

        <div className="projects">
          {projects.map((p, index) => (
            <Card
              key={index}
              title={p.title}
              skills={p.skills}
              type={p.type}
            />
          ))}
        </div>

        <button
          className="ai-btn"
          onClick={() => setMatches(findMatches())}
        >
          🤝 Find Matches
        </button>

        {matches.length > 0 && (
          <div className="matches">
            <h2>🔥 Matches Found</h2>
            {matches.map((m, i) => (
              <Card
                key={i}
                title={`${m.a} 🤝 ${m.b}`}
                skills={`Common Skills: ${m.common.join(", ")}`}
                type={`Match Score: ${m.score}`}
                onClick={() => setActiveChat(m)}
              />
            ))}
          </div>
        )}
      </div>
      <Chat activeChat={activeChat} />
    </>
  );
}