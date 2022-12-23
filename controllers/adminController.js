import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import Category from "../models/categoryModel.js";
import CategoryDetail from "../models/categoryDetailModel.js";

import url from "url";

//Categories
export const renderCategories = catchAsync(async (req, res) => {
  const categoryDetail = await CategoryDetail.find().lean();
  res.render("admin/categories.hbs", {
    categories: categoryDetail,
    layout: "admin.hbs",
  });
});

export const addCategories = catchAsync(async (req, res) => {
  const addCategoriesData = await CategoryDetail.create(req.body);
  const categoryDetail = await CategoryDetail.find().lean();
  res.render("admin/categories.hbs", {
    categories: categoryDetail,
    layout: "admin.hbs",
  });
  
});

export const editCategories = catchAsync(async (req, res) => {
  console.log(req.params.id);
  console.log("edit");
  const updateCategoryData = await CategoryDetail.updateOne(
    { _id: req.params.id },
    { title: req.body.title }
  ).lean();
  res.redirect("/admin/categories");
});

export const deleteCategories = catchAsync(async (req, res) => {
  console.log(req.params.id);
  console.log("delete");
  const deleteCategoryData = await CategoryDetail.deleteOne({ _id: req.params.id }).lean();
  res.redirect("/admin/categories");
});

//Courses
export const renderCourses = async (req, res) => {
  const allCourses = await Course.find().lean();
  const allCategories = await Category.find().lean();
  res.render("admin/courses.hbs", {
    courses: allCourses,
    category: allCategories,
    layout: "admin.hbs",
  });
};

export const renderCoursesByCategories = async (req, res) => {
  const categoryName = await Category.findOne({
    slug: url.parse(req.url, true).query.slug,
  });
  console.log(categoryName.title);
  const allCoursesByCategories = await Course.find({
    name: categoryName.title,
  }).lean();
  const allCategories = await Category.find().lean();
  res.render("admin/courses.hbs", {
    courses: allCoursesByCategories,
    category: allCategories,
    layout: "admin.hbs",
  });
};

export const deleteCourses = async (req, res) => {
  console.log(req.params.id);
  console.log("delete");
  res.redirect("/admin/courses");
};
