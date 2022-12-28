import shoppingCartModel from '../models/shoppingCartModel.js';
import catchAsync from '../utilities/catchAsync.js';

const get_shopping_cart_total = (app) => app.use(catchAsync(async (req, res, next) => {
    const number = (res.locals.auth) 
    ? await shoppingCartModel.find({ user_id: res.locals.authUser._id }).count()
    : 0;

    res.locals.cart_number = number;

    next();
}));

export default get_shopping_cart_total;