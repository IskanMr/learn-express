const express = require("express");
const pool = require("./db");
const port = 3000;

const app = express();
app.use(express.json());

// Routes

// GET all schools
app.get("/schools", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM schools");
    res.status(200).send(data.rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// GET a single school by ID
app.get("/schools/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await pool.query("SELECT * FROM schools WHERE id = $1", [id]);
    if (data.rows.length === 0) {
      return res.status(404).send({ message: "School not found" });
    }
    res.status(200).send(data.rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// CREATE a new school
app.post("/schools", async (req, res) => {
  const { name, address } = req.body;
  try {
    const newSchool = await pool.query(
      "INSERT INTO schools (name, address) VALUES ($1, $2) RETURNING *",
      [name, address]
    );
    res.status(201).send(newSchool.rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// UPDATE a school by ID
app.put("/schools/:id", async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  try {
    const updatedSchool = await pool.query(
      "UPDATE schools SET name = $1, address = $2 WHERE id = $3 RETURNING *",
      [name, address, id]
    );
    if (updatedSchool.rows.length === 0) {
      return res.status(404).send({ message: "School not found" });
    }
    res.status(200).send(updatedSchool.rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// DELETE a school by ID
app.delete("/schools/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSchool = await pool.query(
      "DELETE FROM schools WHERE id = $1 RETURNING *",
      [id]
    );
    if (deletedSchool.rows.length === 0) {
      return res.status(404).send({ message: "School not found" });
    }
    res.status(200).send({ message: "School deleted successfully" });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Setup route to create the table
app.get("/setup", async (req, res) => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS schools (id SERIAL PRIMARY KEY, name VARCHAR(100), address VARCHAR(100))"
    );
    res.status(200).send({ message: "Successfully created table" });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(port, () => console.log(`Server has started on port: ${port}`));
