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
      const course = await Course.findOne({ _id: m });
      // console.log(course);

      courses.push({
        id: m,
        slug: course.slug,
        name: course.name,
        img: course.img,
        author: course.author,
        category: course.category,
        date: course.date.slice(0, course.date.indexOf("T"))
      });
    }
  }


  res.render(res.locals.handlebars, { courses: JSON.stringify(courses) });

});