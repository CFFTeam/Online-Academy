import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import CourseDetail from "../models/courseDetailsModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";


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
  const updateCategoryData = await Category.updateOne(
    { _id: req.params.id },
    { title: req.body.title }
  ).lean();
  res.redirect("/admin/categories");
});

export const deleteCategories = catchAsync(async (req, res) => {
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
  const updateCourses= await Course.updateOne(
    { _id: req.params.id },
    { sale: Number(req.body.sale) }
  ).lean();
  res.redirect("/admin/courses");
});

export const viewMoreCourse = catchAsync(async (req, res) => {
  const course= await Course.findOne({ _id: req.params.id }).lean();
  const courseDetail = await CourseDetail.findOne({ course_id: req.params.id }).lean();
  courseDetail["integerPart"] = Array(Math.floor(courseDetail.avg_rating)).fill('0');
  courseDetail["isRemainder"] = courseDetail.avg_rating - Math.floor(courseDetail.avg_rating) !==0;
  course.date = course.date.slice(0,10);
  res.render("admin/courseDetail.hbs", {
    course: course,
    courseDetail: courseDetail,
    layout: "admin.hbs",
  });
});


export const deleteCourses = catchAsync(async (req, res) => {
  await Course.deleteOne({ _id: req.params.id }).lean();
  await CourseDetail.deleteOne({ course_id: req.params.id }).lean();
  res.redirect("/admin/courses");
});

//-------------------Teacher------------------------
export const renderTeachers = catchAsync(async (req, res) => {
  const allTeachers = await User.find({role: "instructor"}).lean();
  res.render("admin/teachers.hbs", {
    teachers: allTeachers,
    layout: "admin.hbs",
  });
});

export const addTeachers = catchAsync(async (req, res) => {
  await User.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    role: "instructor",
    myCourses: []
  })
  res.redirect("/admin/teachers");
});

export const notExistTeachers = catchAsync(async (req, res) => {
  console.log(req.query.email);
  const teacher = await User.find({email: req.query.email}).lean();
  console.log(teacher);

  if(teacher.length===0){
    return res.json(true);
  }
  else res.json(false);
});

export const editTeachers = catchAsync(async (req, res) => {
  await User.updateOne(
    {_id: req.params.id}, 
    {name: req.body.title}
  ).lean();
  res.redirect("/admin/teachers");
});

export const banTeachers = catchAsync(async (req, res) => {
  const getUser = await User.findOne({_id: req.params.id}).lean();
  let banStatus=getUser.active;
  await User.updateOne(
    {_id: req.params.id}, 
    {active: !banStatus}
  ).lean();
  res.redirect("/admin/teachers");
});

export const deleteTeachers = catchAsync(async (req, res) => {
  await User.deleteOne({_id: req.params.id}).lean();
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