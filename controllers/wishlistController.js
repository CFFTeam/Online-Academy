import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";


export const wishlistPage = catchAsync(async (req, res) => {
  res.locals.handlebars = "wishlist/wishlist";

  res.render(res.locals.handlebars);
});