import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import CourseDetail from "../models/courseDetailsModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import url from "url";

//-----------------Categories--------------
export const renderCategories = catchAsync(async (req, res) => {
  res.locals.handlebars = "admin/categories";
  res.locals.HTMLTitle = "Categories";

  const category = await Category.find().lean();
  const course = await Course.find().lean();

  let isEmpty = false;
  if (category.length === 0) {
    true
  }
  let getAllCategories = [];
  for (let i = 0; i < category.length; i++) {
    for (let j = 0; j < category[i].subcategories.length; j++) {
      const courseObject = await Course.find({ category: category[i]._id }).lean();
      const course = [...courseObject];
      let count = 0;
      for (let z = 0; z < course.length; z++) {
        if (course[z].subcategory.includes(category[i].subcategories[j]._id.toString())) {
          count++;
        }
      }
      getAllCategories.push({
        _id: category[i]._id,
        category: category[i].title,
        subcategory: category[i].subcategories[j].content,
        num_courses: count,
        empty_courses: count === 0 ? true : false,
        idsub: category[i].subcategories[j]._id
      });
    }
  }

  res.render("admin/categories.hbs", {
    category: category,
    categories: getAllCategories,
    isEmpty: isEmpty,
    layout: "admin.hbs"
  });
});

export const renderCategoriesByCategories = catchAsync(async (req, res) => {
  
  const category = await Category.find().lean();
  const categoryName = await Category.findOne({
    slug: url.parse(req.url, true).query.slug
  });

  let isEmpty = false;
  if (categoryName.length === 0) {
    true
  }
  let getAllCategories = [];
  for (let j = 0; j < categoryName.subcategories.length; j++) {
    const courseObject = await Course.find({ category: categoryName._id }).lean();
    const course = [...courseObject];
    let count = 0;
    for (let z = 0; z < course.length; z++) {
      if (course[z].subcategory.includes(categoryName.subcategories[j]._id.toString())) {
        count++;
      }
    }
    getAllCategories.push({
      _id: categoryName._id,
      category: categoryName.title,
      subcategory: categoryName.subcategories[j].content,
      num_courses: count,
      empty_courses: count === 0 ? true : false,
      idsub: categoryName.subcategories[j]._id
    });
  }

  res.render("admin/categories.hbs", {
    category: category,
    categories: getAllCategories,
    isEmpty: isEmpty,
    layout: "admin.hbs"
  });
});

export const addCategories = catchAsync(async (req, res) => {
  const getCategoryInDB = await Category.findOne({title: req.body.newtitle}).lean();
  if(getCategoryInDB===null){
    const getData = {
      slug: "/" + req.body.newtitle.toLowerCase().replaceAll(" ", "-"),
      title: req.body.newtitle,
      subcategories: [
        {
          slug: "/None",
          content: "None"
        }
      ]
    }
    const addCategoriesData = await Category.create(getData);
  }
  else{
    let subCat = getCategoryInDB.subcategories;
    subCat.push({
      slug: "/none",
      content: "None"
    });
    await Category.updateOne({title: req.body.newtitle}, {subcategories: [...subCat]});
  }
  res.redirect("/admin/categories");
});

export const editCategories = catchAsync(async (req, res) => {
  if(req.body.title!==""){
    const getOldCategory = await Category.findOne({ _id: req.params.id }).lean();
    const getOldCategoryData = getOldCategory.title;
    await Category.updateOne(
      { _id: req.params.id },
      { title: req.body.title }
    ).lean();
    await Course.updateMany(
      { category: getOldCategoryData },
      { category: req.body.title }
    ).lean();
  }
  res.redirect("/admin/categories");
});

export const editSubCategories = catchAsync(async (req, res) => {
  if(req.body.subcat!==""){
    const getOldCategory = await Category.findOne({ _id: req.params.id }).lean();
    let getOldCategoryData = getOldCategory.subcategories;
    let tempNameCat;
    for (let i = 0; i < getOldCategoryData.length; i++) {
      if (getOldCategoryData[i]._id.toString() === req.params.idsub.toString()) {
        tempNameCat = getOldCategoryData[i]._id;
        getOldCategoryData[i].content = req.body.subcat;
        getOldCategoryData[i].slug = "/" + req.body.subcat.toLowerCase().replaceAll(" ", "-");
      }
    }
    await Category.updateOne(
      { _id: req.params.id },
      { subcategories: [...getOldCategoryData] }
    ).lean();
  
    const getOldCourseObj = await Course.find({ category: getOldCategory._id }).lean();
    let getOldCourse = [...getOldCourseObj];
    for (let i = 0; i < getOldCourse.length; i++) {
      let getOldCourseData = getOldCourse[i].subcategory;
      for (let j = 0; j < getOldCourseData.length; j++) {
        if (getOldCourseData[j] === tempNameCat) {
          getOldCourseData[j] = req.body.subcat;
          await Course.updateMany(
            { _id: getOldCourse[i]._id },
            { subcategory: [...getOldCourseData] }
          ).lean();
          break;
        }
      }
    }
  }

  res.redirect("/admin/categories");
});

export const deleteCategories = catchAsync(async (req, res) => {
  const getCategoryData = await Category.findOne({
    _id: req.params.id
  }).lean();

  const subcategories = [...getCategoryData.subcategories];
  if (subcategories.length === 1) {
    await Category.deleteOne({ _id: req.params.id }).lean();
  }
  else {
    for (let i = 0; i < subcategories.length; i++) {
      if (subcategories[i]._id.toString() === req.params.idsub.toString()) {
        subcategories.splice(i, 1);
      }
    }

    await Category.updateOne(
      { _id: req.params.id },
      { subcategories: [...subcategories] }
    )
  }
  res.redirect("/admin/categories");
});



//-------------------Courses------------------------
export const renderCourses = catchAsync(async (req, res) => {
  res.locals.HTMLTitle = "Courses";

  res.locals.handlebars = "admin/courses";
  let allCourses = await Course.find().lean();
  const allCategories = await Category.find().lean();
  const instructors = await User.find({role:"instructor"}).lean();
  for(let i=0; i<allCourses.length; i++) {
    for(let j=0; j<instructors.length; j++){
      if(allCourses[i].author===instructors[j]._id.toString()){
        allCourses[i]['nameAuthor']=instructors[j].name;
      }
    }
    for(let j=0; j<allCategories.length; j++){
      if(allCourses[i].category===allCategories[j]._id.toString()){
        allCourses[i]['nameCategory']=allCategories[j].title;
      }
    }
  }
  let isEmpty = false;
  if (allCourses.length === 0 || allCategories.length === 0) {
    isEmpty = true;
  }
  res.render("admin/courses.hbs", {
    courses: allCourses,
    isEmpty: isEmpty,
    category: allCategories,
    instructor: instructors,
    layout: "admin.hbs"
  });
});

export const renderCoursesByCategories = catchAsync(async (req, res) => {
  res.locals.HTMLTitle = "Courses";

  const categoryName = await Category.findOne({
    slug: url.parse(req.url, true).query.slug
  });
  const allCourses = await Course.find({
    category: categoryName._id
  }).lean();

  let isEmpty = false;
  if (categoryName.length === 0 || allCourses.length === 0) {
    isEmpty = true;
  }

  const allCategories = await Category.find().lean();
  const instructors = await User.find({role:"instructor"}).lean();

  for(let i=0; i<allCourses.length; i++) {
    for(let j=0; j<instructors.length; j++){
      if(allCourses[i].author===instructors[j]._id.toString()){
        allCourses[i]['nameAuthor']=instructors[j].name;
      }
    }
    for(let j=0; j<allCategories.length; j++){
      if(allCourses[i].category===allCategories[j]._id.toString()){
        allCourses[i]['nameCategory']=allCategories[j].title;
      }
    }
  }

  res.render("admin/courses.hbs", {
    courses: allCourses,
    isEmpty: isEmpty,
    category: allCategories,
    instructor: instructors,
    layout: "admin.hbs"
  });
});

export const renderCoursesByInstructors = catchAsync(async (req, res) => {
  res.locals.HTMLTitle = "Courses";

  const allCourses = await Course.find({
    author: req.params.id
  }).lean();

  let isEmpty = false;
  if (allCourses.length === 0) {
    isEmpty = true;
  }

  const allCategories = await Category.find().lean();
  const instructors = await User.find({role:"instructor"}).lean();

  for(let i=0; i<allCourses.length; i++) {
    for(let j=0; j<instructors.length; j++){
      if(allCourses[i].author===instructors[j]._id.toString()){
        allCourses[i]['nameAuthor']=instructors[j].name;
      }
    }
    for(let j=0; j<allCategories.length; j++){
      if(allCourses[i].category===allCategories[j]._id.toString()){
        allCourses[i]['nameCategory']=allCategories[j].title;
      }
    }
  }
  res.render("admin/courses.hbs", {
    courses: allCourses,
    category: allCategories,
    instructor: instructors,
    isEmpty: isEmpty,
    layout: "admin.hbs"
  });
});

export const editCourses = catchAsync(async (req, res) => {
  const updateCourses = await Course.updateOne(
    { _id: req.params.id },
    { sale: Number(req.body.sale) }
  ).lean();
  res.redirect("/admin/courses");
});

export const banCourses = catchAsync(async (req, res) => {
  const getCourse = await Course.findOne({_id: req.params.id}).lean();
  const tempStatus =  getCourse.active;
  const updateCourses = await Course.updateOne(
    { _id: req.params.id },
    { active: !tempStatus }
  ).lean();
  res.redirect("/admin/courses");
});

export const viewMoreCourse = catchAsync(async (req, res) => {
  const allCourses = await Course.findOne({ _id: req.params.id }).lean();
  res.locals.HTMLTitle = allCourses.name;

  const courseDetail = await CourseDetail.findOne({ course_id: req.params.id }).lean();
  courseDetail["integerPart"] = Array(Math.floor(courseDetail.avg_rating)).fill('0');
  courseDetail["isRemainder"] = courseDetail.avg_rating - Math.floor(courseDetail.avg_rating) !== 0;
  
  const allCategories = await Category.find().lean();
  const instructors = await User.find({role:"instructor"}).lean();

  for(let j=0; j<instructors.length; j++){
    if(allCourses.author===instructors[j]._id.toString()){
      allCourses['nameAuthor']=instructors[j].name;
    }
  }
  allCourses['nameSubCategory'] = [];
  for(let i=0; i<allCategories.length; i++){
    if(allCourses.category===allCategories[i]._id.toString()){
      allCourses['nameCategory']=allCategories[i].title;
    }
    for(let j=0; j<allCategories[i].subcategories.length; j++){
      for(let z=0; z<allCourses.subcategory.length; z++){
        if(allCourses.subcategory[z]===allCategories[i].subcategories[j]._id.toString()){
          allCourses['nameSubCategory'].push(allCategories[i].subcategories[j].content);
        }
      }
    }
  }

  allCourses.date = allCourses.date.slice(0, 10);
  res.render("admin/courseDetail.hbs", {
    course: allCourses,
    courseDetail: courseDetail,
    layout: "admin.hbs"
  });
});


export const deleteCourses = catchAsync(async (req, res) => {
  await Course.deleteOne({ _id: req.params.id }).lean();
  await CourseDetail.deleteOne({ course_id: req.params.id }).lean();
  res.redirect("/admin/courses");
});

//-------------------Teacher------------------------
export const renderTeachers = catchAsync(async (req, res) => {
  res.locals.handlebars = "admin/teachers";
  res.locals.HTMLTitle = "Teachers";
  const allTeachers = await User.find({ role: "instructor" }).lean();
  res.render("admin/teachers.hbs", {
    teachers: allTeachers,
    layout: "admin.hbs"
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
  const teacher = await User.find({ email: req.query.email }).lean();

  if (teacher.length === 0) {
    return res.json(true);
  }
  else res.json(false);
});

export const editTeachers = catchAsync(async (req, res) => {
  await User.updateOne(
    { _id: req.params.id },
    { name: req.body.title }
  ).lean();
  res.redirect("/admin/teachers");
});

export const banTeachers = catchAsync(async (req, res) => {
  const getUser = await User.findOne({ _id: req.params.id }).lean();
  let banStatus = getUser.active;
  await User.updateOne(
    { _id: req.params.id },
    { active: !banStatus }
  ).lean();
  res.redirect("/admin/teachers");
});

export const deleteTeachers = catchAsync(async (req, res) => {
  await User.deleteOne({ _id: req.params.id }).lean();
  res.redirect("/admin/teachers");
});


//-------------------Student------------------------
export const renderStudents = catchAsync(async (req, res) => {
  res.locals.handlebars = "admin/students";
  res.locals.HTMLTitle = "Students";

  const allStudents = await User.find({ role: "user" }).lean();
  res.render("admin/students.hbs", {
    students: allStudents,
    layout: "admin.hbs"
  });
});

export const editStudents = catchAsync(async (req, res) => {
  await User.updateOne(
    { _id: req.params.id },
    { name: req.body.title }
  ).lean();
  res.redirect("/admin/students");
});

export const banStudents = catchAsync(async (req, res) => {
  const getUser = await User.findOne({ _id: req.params.id }).lean();
  let banStatus = getUser.active;
  await User.updateOne(
    { _id: req.params.id },
    { active: !banStatus }
  ).lean();
  res.redirect("/admin/students");
});

export const deleteStudents = catchAsync(async (req, res) => {
  await User.deleteOne({ _id: req.params.id }).lean();
  res.redirect("/admin/students");
});