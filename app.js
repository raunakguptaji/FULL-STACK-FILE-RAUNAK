const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const students = [
  { name: "Aarav Sharma", course: "Web Development" },
  { name: "Meera Singh", course: "Computer Science" }
];

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (character) => {
    const characters = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return characters[character];
  });
}

function makePage(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Student Directory</title>
    </head>
    <body>
      <header>
        <h1>Student Directory</h1>
        <nav>
          <a href="/">Home</a> |
          <a href="/students">Students</a> |
          <a href="/contact">Contact</a>
        </nav>
      </header>
      <main>${content}</main>
    </body>
    </html>
  `;
}

app.get("/", (req, res) => {
  res.send(makePage("Home", `
    <h2>Welcome</h2>
    <p>A simple student directory made with Express.</p>
    <p><a href="/students">See the students</a></p>
  `));
});

app.get("/students", (req, res) => {
  const studentList = students.map((student) => `
    <li>${escapeHtml(student.name)} - ${escapeHtml(student.course)}</li>
  `).join("");

  res.send(makePage("Students", `
    <h2>Students</h2>
    <ul>${studentList}</ul>
    <h3>Add a student</h3>
    <form action="/students" method="POST">
      <label>Name: <input name="name" required></label><br><br>
      <label>Course: <input name="course" required></label><br><br>
      <button type="submit">Add student</button>
    </form>
  `));
});

app.post("/students", (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const course = typeof body.course === "string" ? body.course.trim() : "";

  if (!name || !course) {
    return res.status(400).send(makePage("Students", `
      <p>Please enter both a name and a course.</p>
      <p><a href="/students">Go back</a></p>
    `));
  }

  students.push({ name, course });
  res.redirect("/students");
});

app.get("/contact", (req, res) => {
  res.send(makePage("Contact", `
    <h2>Contact</h2>
    <form action="/contact" method="POST">
      <label>Name: <input name="name" required></label><br><br>
      <label>Message: <textarea name="message" required></textarea></label><br><br>
      <button type="submit">Send message</button>
    </form>
  `));
});

app.post("/contact", (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !message) {
    return res.status(400).send(makePage("Contact", `
      <p>Please enter your name and message.</p>
      <p><a href="/contact">Go back</a></p>
    `));
  }

  res.send(makePage("Contact", `
    <h2>Thank you, ${escapeHtml(name)}!</h2>
    <p>Your message has been received.</p>
    <p><a href="/">Back to home</a></p>
  `));
});

app.listen(PORT, () => {
  console.log(`Student Directory is running at http://localhost:${PORT}`);
});
