import { isValidObjectId } from "mongoose";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";


export const myCoursesPage = catchAsync(async (req, res) => {
  res.locals.handlebars = "myCourses/myCourses";
  let user = null;
  const courses = [];
  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id });
  }
  if (user) {
    for (const m of user.myCourses) {
      if (isValidObjectId(m)) {
        const course = await Course.findOne({ _id: m });
        // console.log("name: ", course.author);
        const author = await User.findOne({ _id: course.author }).lean();
        if (course != null) {
          courses.push({
            id: m,
            slug: course.slug,
            name: course.name,
            img: course.img,
            author: author.name,
            category: course.category,
            date: course.date.slice(0, course.date.indexOf("T"))
          });
        }
        else {
          console.log("in")
          user.myCourses.splice(user.myCourses.indexOf(m), 1);
          await User.updateOne(
            { _id: res.locals.authUser._id },
            { myCourses: [...user.myCourses] }
          )
        }
      }
      else {
        console.log("out")
        user.myCourses.splice(user.myCourses.indexOf(m), 1);
        await User.updateOne(
          { _id: res.locals.authUser._id },
          { myCourses: [...user.myCourses] }
        )
      }
<<<<<<< HEAD
=======
      const course = await Course.findOne({ _id: m });
      courses.push({
        id: m,
        slug: course.slug,
        name: course.name,
        img: course.img,
        author: course.author,
        category: course.category,
        date: course.date.slice(0, course.date.indexOf("T"))
      });
>>>>>>> ec91b26987da769aee1bb9da39afdfb1432eb963
    }
  }


  res.render(res.locals.handlebars, { courses: JSON.stringify(courses) });

});