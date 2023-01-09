import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import CourseDetails from "../models/courseDetailsModel.js";
import catchAsync from "../utilities/catchAsync.js";
import Category from "../models/categoryModel.js";
import { isValidObjectId } from "mongoose";

export const wishlistPage = catchAsync(async (req, res) => {
  res.locals.HTMLTitle = 'Wish list';
  res.locals.handlebars = "wishlist/wishlist";
  let user = null;
  const courses = [];
  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id });
  }
  if (user) {
    for (const m of user.wishlist) {
      if (isValidObjectId(m)) {
        const course = await Course.findOne({ _id: m });
        if (course != null) {
          const courseDetails = await CourseDetails.findOne({ course_id: m }).lean();
          const author = await User.findOne({ _id: course.author }).lean();
          const category = await Category.findOne({ _id: course.category }).lean();

          courses.push({
            id: m,
            slug: course.slug,
            name: course.name,
            img: course.img,
            author: author.name,
            category: category.title,
            date: course.date.slice(0, course.date.indexOf("T")),
            price: course.price,
            rate: courseDetails.avg_rating,
            numReview: courseDetails.num_reviews,
            view: courseDetails.viewer
          });
        }
        else {
          user.wishlist.splice(user.wishlist.indexOf(m), 1);
          await User.updateOne(
            { _id: res.locals.authUser._id },
            { wishlist: [...user.wishlist] })
        }
      }
      else {
        user.wishlist.splice(user.wishlist.indexOf(m), 1);
        await User.updateOne(
          { _id: res.locals.authUser._id },
          { wishlist: [...user.wishlist] }
        )
      }
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
  else {
    courses.splice(courses.indexOf(req.params.id), 1);
  }
  await User.updateOne(
    { _id: res.locals.authUser._id },
    { wishlist: [...courses] }
  )
  res.redirect("back");
});

