import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import Category from "../models/categoryModel.js";

import url from "url";

//-----------------Categories--------------
export const renderCategories = catchAsync(async (req, res) => {
  const category = await Category.find().lean();
  res.render("admin/categories.hbs", {
    categories: category,
    layout: "admin.hbs",
  });
});

export const addCategories = catchAsync(async (req, res) => {
  const addCategoriesData = await Category.create(req.body);
  const category = await Category.find().lean();
  res.render("admin/categories.hbs", {
    categories: category,
    layout: "admin.hbs",
  });
});

export const editCategories = catchAsync(async (req, res) => {
  console.log(req.params.id);
  console.log("edit");
  const updateCategoryData = await Category.updateOne(
    { _id: req.params.id },
    { title: req.body.title }
  ).lean();
  res.redirect("/admin/categories");
});

export const deleteCategories = catchAsync(async (req, res) => {
  console.log(req.params.id);
  console.log("delete");
  const deleteCategoryData = await Category.deleteOne({
    _id: req.params.id,
  }).lean();
  res.redirect("/admin/categories");
});

//-------------------Courses------------------------
export const renderCourses = catchAsync(async (req, res) => {
  const allCourses = await Course.find().lean();
  const allCategories = await Category.find().lean();
  res.render("admin/courses.hbs", {
    courses: allCourses,
    category: allCategories,
    layout: "admin.hbs",
  });
});

export const renderCoursesByCategories = catchAsync(async (req, res) => {
  const categoryName = await Category.findOne({
    slug: url.parse(req.url, true).query.slug,
  });
  console.log(url.parse(req.url, true).pathname);
  console.log(categoryName.title);
  const allCoursesByCategories = await Course.find({
    category: categoryName.title,
  }).lean();
  const allCategories = await Category.find().lean();
  res.render("admin/courses.hbs", {
    courses: allCoursesByCategories,
    category: allCategories,
    layout: "admin.hbs",
  });
});

export const editCourses = catchAsync(async (req, res) => {
  console.log(req.params.id);
  console.log("edit");
  const updateCourses= await Course.updateOne(
    { _id: req.params.id },
    { sale: req.body.sale }
  ).lean();
  res.redirect("/admin/courses");
});

export const deleteCourses = catchAsync(async (req, res) => {
  const deleteCourses = await Course.deleteOne({ _id: req.params.id }).lean();
  res.redirect("/admin/courses");
});

//-------------------Teacher------------------------
export const renderTeachers = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  const a = [
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },

    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
  ];
  const allCategories = await Category.find().lean();
  res.render("admin/teachers.hbs", {
    teachers: a,
    category: allCategories,
    layout: "admin.hbs",
  });
});

export const addTeachers = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/teachers");
});

export const editTeachers = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/teachers");
});

export const banTeachers = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/teachers");
});

export const deleteTeachers = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/teachers");
});


//-------------------Student------------------------
export const renderStudents = catchAsync(async (req, res) => {
  //const allStudents = await Student.find().lean();
  const a = [
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },

    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
    {
      _id: 1,
      name: "Jonas Schmedtmann",
    },
  ];
  const allCategories = await Category.find().lean();
  res.render("admin/students.hbs", {
    students: a,
    category: allCategories,
    layout: "admin.hbs",
  });
});

export const addStudents = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/students");
});

export const editStudents = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/students");
});

export const banStudents = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/students");
});

export const deleteStudents = catchAsync(async (req, res) => {
  //const allTeachers = await Teacher.find().lean();
  res.redirect("/admin/students");
});