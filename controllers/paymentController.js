import CourseDetails from "../models/courseDetailsModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import ShoppingCart from "../models/shoppingCartModel.js";
import catchAsync from "../utilities/catchAsync.js";


export const shoppingCartPage = catchAsync(async (req, res, next) => {
  res.locals.handlebars = "payment/payment";

  let shoppingCart = null;
  let course = []

  if (res.locals && res.locals.authUser) {
    shoppingCart = Object.values(await ShoppingCart.find({ user_id: res.locals.authUser._id }));
  }

  if (shoppingCart && shoppingCart.length > 0) {
    for (const sc of shoppingCart) {
      const courses = await Course.findOne({ _id: sc.course_id }).lean();
      const courseDetails = await CourseDetails.findOne({ course_id: sc.course_id });

      course.push({
        id: sc._id,
        discount: courses.sale,
        name: courses.name,
        img: courses.img,
        rate: courseDetails.avg_rating,
        numReview: courseDetails.num_reviews,
        view: courseDetails.viewer,
        author: courses.author,
        date: courses.date.slice(0, courses.date.indexOf("T")),
        price: courses.price
      });
    }
  }

  res.locals.cart_number = shoppingCart && shoppingCart.length > 0 ? shoppingCart.length : 0;

  res.render("payment/payment", { course: JSON.stringify(course) });
});

export const updateShoppingCart = catchAsync(async (req, res, next) => {
  if (req.body.deleteItem == "delete") {
    await ShoppingCart.deleteOne({ _id: req.body.id });
  }
  else if (req.body.deleteItem == "checkout") {
    if (res.locals && res.locals.authUser) {
      const shoppingCart = Object.values(await ShoppingCart.find({ user_id: res.locals.authUser._id }));
      if (shoppingCart && shoppingCart.length > 0) {
        for (const sc of shoppingCart) {
          const courses = await Course.findOne({ _id: sc.course_id }).lean();
          
          const user = await User.findOne({ _id: res.locals.authUser._id });
          
          const current_course = {
            course_id: sc.course_id,
            total: courses.lectures.total,
            progress: []
          };

          courses.lectures.sections.forEach(section => {
            section.lessons.forEach(lesson => {
              current_course.progress.push({
                lesson_id: lesson._id,
                status: false
              });
            });
          });

          await User.updateOne(
            { _id: sc.user_id },
            { myCourses: [...user.myCourses, sc.course_id], my_progress: [...user.my_progress, current_course] })
          
            await ShoppingCart.deleteOne({ _id: sc._id });
        }
      }
    }
  }
  else {
    const  {course_id}  = req.body;
    const backURL = req.headers.referer.split('?')[0];

    if (!res.locals.auth){
      return res.redirect(`${backURL}?message=Please login to continue}`);
    }
    const shopping_cart = { course_id: course_id, user_id: res.locals.authUser._id };
    const prev_course = await ShoppingCart.findOne(shopping_cart).lean();

    const my_courses = await User.findOne({ _id: res.locals.authUser._id }).lean();

    if (prev_course) {
      return res.redirect(`${backURL}?message=Course already in cart`);
    }
    
    // if (Object.values(my_courses).length > 0) {
    //   return res.redirect(`${backURL}?message=Course already in my courses`);
    // }

    await ShoppingCart.create(shopping_cart);

    return res.redirect(`${backURL}?message=Course added to cart`);
  }

  if (req.body.deleteItem == "delete" || req.body.deleteItem == "checkout")
    shoppingCartPage(req, res, next)
})


