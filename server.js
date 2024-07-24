/*********************************************************************************
 *  WEB700 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part
 *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Andre Hideo Onoda Monteiro Student ID: 101947232 Date: 06/11/2024
 *
 ********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const exphbs = require("express-handlebars");
var path = require("path");

var dataCollection = require("./modules/collegeData");
var app = express();

app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute
            ? ' class="nav-item active" '
            : ' class="nav-item" ') +
          '><a class="nav-link" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      courseOptions: function (num, options) {
        let result = "";
        for (let i = 1; i <= num; i++) {
          result +=
            '<option value="' +
            i +
            '" ' +
            (options.fn(this) == i ? "selected" : "") +
            " >" +
            i +
            "</option> ";
        }
        return result;
      },
    },
  }),
);
app.set("view engine", "hbs");

app.use(express.static("./public/"));
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});

app.get("/students", (req, res) => {
  if (req.query.course) {
    dataCollection
      .getStudentsByCourse(req.query.course)
      .then((result) => res.render("students", { students: result }))
      .catch((err) => res.status(500).send({ message: "no results" }));
  } else {
    dataCollection
      .getAllStudents()
      .then((result) => res.render("students", { students: result }))
      .catch((err) => res.status(500).send({ message: "no results" }));
  }
});

app.get("/students/add", (req, res) => {
  res.render("addStudent", { layout: "main" });
});

app.post("/student/update", (req, res) => {
  dataCollection.updateStudent(req.body).then(() => res.redirect("/students"));
});

app.post("/students/add", (req, res) => {
  dataCollection
    .addStudent(req.body)
    .then((v) => res.redirect("/students/" + v))
    .catch((err) =>
      res.status(500).send({ message: "Couldn't register student." }),
    );
});

app.get("/students/:studentId", (req, res) => {
  dataCollection
    .getStudentByNum(req.params.studentId)
    .then((result) => res.render("student", { student: result }))
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.get("/courses", (req, res) => {
  dataCollection
    .getCourses()
    .then((result) => res.render("courses", { courses: result }))
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.get("/courses/:courseId", (req, res) => {
  dataCollection
    .getCourseById(req.params.courseId)
    .then((result) => res.render("course", { course: result }))
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.get("/", (req, res) => {
  res.render("home", { layout: "main" });
});
app.get("/about", (req, res) => {
  res.render("about", { layout: "main" });
});
app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo", { layout: "main" });
});

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "404.html"));
});

dataCollection
  .initialize()
  .then(() =>
    app.listen(HTTP_PORT, () =>
      console.log("Server listening on port: " + HTTP_PORT),
    ),
  )
  .catch((err) => console.log(err));
