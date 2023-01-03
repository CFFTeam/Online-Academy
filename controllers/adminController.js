import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import CourseDetail from "../models/courseDetailsModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";


import url from "url";

//-----------------Categories--------------
export const renderCategories = catchAsync(async (req, res) => {
  const category = await Category.find().lean();
  const course = await Course.find({}).lean();

  let isEmpty = false;
  if(category.length === 0){
    isEmpty: true
  }
  let getAllCategories = [];
  for(let i = 0; i < category.length; i++){
    for(let j=0; j<category[i].subcategories.length; j++){
      const courseObject = await Course.find({category: category[i].title}).lean();
      const course = [...courseObject];
      let count=0;
      for(let z=0; z<course.length; z++){
        if(course[z].subcategory.includes(category[i].subcategories[j].content)){
          count++;
        }
      }
      getAllCategories.push({
        _id: category[i]._id, 
        category: category[i].title, 
        subcategory: category[i].subcategories[j].content,
        num_courses: count,
        empty_courses: count === 0? true : false,
      });
    }
  }

  res.render("admin/categories.hbs", {
    category: category,
    categories: getAllCategories,
    isEmpty: isEmpty,
    layout: "admin.hbs",
  });
});

export const renderCategoriesByCategories = catchAsync(async (req, res) => {
  const category = await Category.find().lean();
  const categoryName = await Category.findOne({
    slug: url.parse(req.url, true).query.slug,
  });
  
  let isEmpty = false;
  if(categoryName.length === 0){
    isEmpty: true
  }
  let getAllCategories = [];
  for(let j=0; j<categoryName.subcategories.length; j++){
    const courseObject = await Course.find({category: categoryName.title}).lean();
    const course = [...courseObject];
    let count=0;
    for(let z=0; z<course.length; z++){
      if(course[z].subcategory.includes(categoryName.subcategories[j].content)){
        count++;
      }
    }
    getAllCategories.push({
      _id: categoryName._id, 
      category: categoryName.title, 
      subcategory: categoryName.subcategories[j].content,
      num_courses: count,
      empty_courses: count === 0? true : false,
    });
  }

  res.render("admin/categories.hbs", {
    category: category,
    categories: getAllCategories,
    isEmpty: isEmpty,
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
  const getOldCategory = await Category.findOne({ _id: req.params.id }).lean();
  const getOldCategoryData = getOldCategory.title;
  await Category.updateOne(
    { _id: req.params.id },
    { title: req.body.title }
  ).lean();
  await Course.updateMany(
    {category: getOldCategoryData},
    {category: req.body.title}
  ).lean();
  res.redirect("/admin/categories");
});

export const deleteCategories = catchAsync(async (req, res) => {
  const getCategoryData = await Category.findOne({
    _id: req.query.id,
  }).lean();
  
  const subcategories = getCategoryData.subcategories;
  for(let i=0; i<subcategories.length; i++){
    if(subcategories[i]===req.query.sub){
      subcategories.splice(i, 1);
    }
  }
  res.redirect("/admin/categories");
});

//-------------------Courses------------------------
export const renderCourses = catchAsync(async (req, res) => {
  const allCourses = await Course.find().lean();
  const allCategories = await Category.find().lean();
  let isEmpty=false;
  if(allCourses.length===0 || allCategories.length===0) {
    isEmpty =true;
  }
  res.render("admin/courses.hbs", {
    courses: allCourses,
    isEmpty: isEmpty,
    category: allCategories,
    layout: "admin.hbs",
  });
});

export const renderCoursesByCategories = catchAsync(async (req, res) => {
  const categoryName = await Category.findOne({
    slug: url.parse(req.url, true).query.slug,
  });
  const allCoursesByCategories = await Course.find({
    category: categoryName.title,
  }).lean();

  let isEmpty=false;
  if(categoryName.length===0 || allCoursesByCategories.length===0) {
    isEmpty =true;
  }

  const allCategories = await Category.find().lean();
  res.render("admin/courses.hbs", {
    courses: allCoursesByCategories,
    isEmpty: isEmpty,
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
  const allStudents = await User.find({role: "user"}).lean();
  res.render("admin/students.hbs", {
    students: allStudents,
    layout: "admin.hbs",
  });
});

export const editStudents = catchAsync(async (req, res) => {
  await User.updateOne(
    {_id: req.params.id}, 
    {name: req.body.title}
  ).lean();
  res.redirect("/admin/students");
});

export const banStudents = catchAsync(async (req, res) => {
  const getUser = await User.findOne({_id: req.params.id}).lean();
  let banStatus=getUser.active;
  await User.updateOne(
    {_id: req.params.id}, 
    {active: !banStatus}
  ).lean();
  res.redirect("/admin/students");
});

export const deleteStudents = catchAsync(async (req, res) => {
  await User.deleteOne({_id: req.params.id}).lean();
  res.redirect("/admin/students");
});