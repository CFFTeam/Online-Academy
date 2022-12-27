import CourseDetails from "../models/courseDetailsModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import ShoppingCart from "../models/shoppingCartModel.js";
import catchAsync from "../utilities/catchAsync.js";


export const shoppingCartPage = catchAsync(async (req, res, next) => {
  res.locals.handlebars = "payment/shoppingCart";

  let shoppingCart = null;
  let course = []

  if (res.locals && res.locals.authUser) {
    shoppingCart = Object.values(await ShoppingCart.find({ user_id: res.locals.authUser._id }));
  }

  if (shoppingCart && shoppingCart.length > 0) {
    for (const sc of shoppingCart) {
      const courses = await Course.findOne({ _id: sc.course_id }).lean();
      const courseDetails = await CourseDetails.findOne({ course_id: sc.course_id }).lean();


      course.push({
        id: sc._id,
        name: courses.name,
        img: courses.img,
        rate: courseDetails.avg_rating,
        numReview: courseDetails.num_reviews,
        author: courses.author,
        view: courseDetails.viewer,
        date: courses.date.slice(0, courses.date.indexOf("T")),
        price: courses.price
      });
    }
  }


  res.render("payment/payment", { course: JSON.stringify(course) });
});

export const updateShoppingCart = catchAsync(async (req, res, next) => {
  if (req.body.deleteItem == "delete") {
    await ShoppingCart.deleteOne({ _id: req.body.id });
    shoppingCartPage(req, res, next)
  }
})
