import { isValidObjectId } from "mongoose";
import Category from "../models/categoryModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";
import { loadProgress } from "./learningController.js";


export const myCoursesPage = catchAsync(async (req, res) => {
  res.locals.HTMLTitle = 'My courses';
  res.locals.handlebars = "myCourses/myCourses";
  let user = null;
  const courses = [];
  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id });
  }
  if (user) {
    const finishCourses = user.finishCourses;
    for (const m of user.myCourses) {
      if (isValidObjectId(m)) {
        const course = await Course.findOne({ _id: m });

        if (course != null) {
          if (course.finish !== 1 || course.active === false) continue;

          const author = await User.findOne({ _id: course.author }).lean();
          const category = await Category.findOne({ _id: course.category }).lean();
          const progress = await loadProgress(m, res.locals.authUser._id);
          courses.push({
            id: m,
            slug: course.slug,
            name: course.name,
            img: course.img,
            author: author.name,
            category: category.title,
            finish: finishCourses.includes(m),
            date: course.date.slice(0, course.date.indexOf("T")),
            progress: progress
          });
        }
        else {
          user.myCourses.splice(user.myCourses.indexOf(m), 1);
          await User.updateOne(
            { _id: res.locals.authUser._id },
            { myCourses: [...user.myCourses] }
          )
        }
      }
      else {
        user.myCourses.splice(user.myCourses.indexOf(m), 1);
        await User.updateOne(
          { _id: res.locals.authUser._id },
          { myCourses: [...user.myCourses] }
        )
      }
    }
  }


  res.render(res.locals.handlebars, { courses: JSON.stringify(courses) });

});