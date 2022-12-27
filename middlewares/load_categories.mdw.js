import Category from "../models/categoryModel.js";
import catchAsync from "../utilities/catchAsync.js";

const loadCategory = (app) => {
    app.use(catchAsync(async (req, res, next) => { 
        const categories = await Category.find().lean();
        
        res.locals.categories = JSON.stringify(categories);
        
        next();
    }));
};

export default loadCategory;