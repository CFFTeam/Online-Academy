import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import CourseDetails from "../models/courseDetailsModel.js";
import catchAsync from "../utilities/catchAsync.js";


export const wishlistPage = catchAsync(async (req, res) => {
  res.locals.handlebars = "wishlist/wishlist";
  let user = null;
  const courses = [];
  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id });
  }
  if (user) {
    for (const m of user.wishlist) {
      const course = await Course.findOne({ _id: m });
      const courseDetails = await CourseDetails.findOne({ course_id: m }).lean();
      courses.push({
        id: m,
        slug: course.slug,
        name: course.name,
        img: course.img,
        author: course.author,
        category: course.category,
        date: course.date.slice(0, course.date.indexOf("T")),
        price: course.price,
        rate: courseDetails.avg_rating,
        numReview: courseDetails.num_reviews,
        view: courseDetails.viewer
      });
    }
  }

  res.render(res.locals.handlebars, { courses: JSON.stringify(courses) });

});

export const favorite = catchAsync(async (req, res) => {
  let user = null;
  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id }).lean();
  }
  let courses = user.wishlist;
  if (courses.includes(req.params.id) === false) {
    courses.push(req.params.id);
  }
  await User.updateOne(
    { _id: res.locals.authUser._id },
    { wishlist: [...courses] }
  )
  res.redirect('/');
});
