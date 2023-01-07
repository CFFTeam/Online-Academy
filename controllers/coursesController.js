import categoryModel from "../models/categoryModel.js";
import courseModel from "../models/courseModel.js";
import User from "../models/userModel.js";
import courseDetailsModel from "../models/courseDetailsModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import catchAsync from "../utilities/catchAsync.js";

const loadBestSeller = async () => { 
    const allcourses = await courseDetailsModel.find({ viewer: { $gt: 40000 } }, {course_id: 1}).sort({
        viewer: -1,
        course_id: 1
    }).limit(10).lean();
    return allcourses.map(course => course.course_id.toString());
};

const loadCourses = async (categories, authors, myCourses, myWishCourses, find_by = {}, sort_by, offset = 0, limit = 10) => {

    const skip = (offset - 1) * limit;

    const sort_query = {};

    if (sort_by === 'default') {
        sort_query.viewer = -1; 
        sort_query.course_id = 1;
    }
    
    if (sort_by === 'rating') {
        sort_query.avg_rating = -1; 
        sort_query.course_id = 1;
    }

    if (sort_by === 'price') {
        sort_query.price = 1; 
        sort_query._id = 1;
    }

    const bestseller = await loadBestSeller();

    const allcourses = await courseModel.find({ ...find_by, finish: 1, active: true }, {_id: 1});
    const allcourses_id = allcourses.map(course => course._id);

    const courses = (sort_by === 'price') 
    ? await courseModel.find({ ...find_by, finish: 1, active: true })
    .sort(sort_query).collation({ locale: 'en', numericOrdering: true })
    .skip(skip).limit(limit).lean()
    : await courseDetailsModel.find({ course_id: { $in: allcourses_id } }).select('-reviews')
    .sort(sort_query).collation({ locale: 'en', numericOrdering: true })
    .skip(skip).limit(limit).lean()

    const newcourse = [];

    const date = new Date();
    const current_date = date.getTime(); 
    const prev_date = new Date(date.setMonth(date.getMonth() - 3)).getTime();


    for (let index = 0; index < courses.length; index++) {
        const course = (sort_by === 'price') ? courses[index] : await courseModel.findOne({ _id: courses[index].course_id, finish: 1, active: true }).select('-lectures.sections').lean();
        const course_date = new Date(course.date).getTime();
        const coursesDetails = (sort_by === 'price') ? await courseDetailsModel.findOne({ course_id: courses[index]._id }).select('-reviews').lean() : courses[index];
        
        const newest_course = {
            active: index === 0 ? true : false,
            course_id: course._id.toString(),
            course_status: (bestseller.includes(course._id.toString())) ? 'best seller' : (course_date >= prev_date && course_date <= current_date) ? 'new' : '',
            course_name: course.name,
            course_slug: course.slug,
            course_rate: coursesDetails.avg_rating,
            course_vote: fixNumberFormat(coursesDetails.num_reviews),
            course_viewer: fixNumberFormat(coursesDetails.viewer),
            course_author: authors.find(el => el._id.toString() === course.author).name || '',
            course_price: course.price,
            course_category: categories.find(el => el._id.toString() === course.category).title || '',
            course_date: fixDateFormat(course.date),
            course_img: course.img,
            course_description: course.description,
            course_duration: course.lectures.duration,
            course_lessons: course.lectures.total,
            my_courses: myCourses && myCourses.includes(course._id.toString()) ? true : false,
            myWishCourses: (myWishCourses && myWishCourses.includes(course._id.toString())) ? 'chosen' : ''
        }

        newcourse.push(newest_course);
    }

    const total = Math.ceil(allcourses.length / limit);
    return { courses: newcourse, total_pages: total};
};

const getPageList = (totalPage) => {
    const pageList = [1];
    if (totalPage > 10) {
        for (let i = 2; i <= Math.min(totalPage, 4); ++i)
            pageList.push(i);
        
        pageList.push("...");

        for (let i = Math.min(totalPage - 4, 4); i >= 1; --i)
            pageList.push(totalPage - i + 1);
    }
    else 
        for (let i = 2; i <= totalPage; ++i)
            pageList.push(i);
    return pageList;
};

export const coursesPage = catchAsync(async (req, res) => {
    res.locals.handlebars = 'home/courses';
    res.locals.sort_by = req.query.sort_by || 'default';
    res.locals.page = req.query.page || 1;

    const categories = JSON.parse(res.locals.categories);
    const authors = await User.find().select('name').lean();

    const find_by = req.find_by;

    const limit = 10;
    const offset = res.locals.page;

    const results = await loadCourses(categories, authors, req.myCourses, req.myWishCourses, find_by, res.locals.sort_by, offset, limit);

    const courses = results.courses;
    const totalPage = results.total_pages;

    const pageList = getPageList(totalPage);

    const prev_page = +offset - 1 > 0 ? +offset - 1 : false;
    const next_page = +offset + 1 <= totalPage ? +offset + 1 : false;

    res.render(res.locals.handlebars, { courses, pageList: pageList, prev_page: prev_page, next_page: next_page });
});

export const loadCategory = catchAsync(async (req, res, next) => { 

    const { category, subcategory } = req.params;
    const find_by = {}

    req.find_by = {};

    if (category || subcategory) {
        if (category)
            find_by.slug = `/${category}`;
        
        if (subcategory)
            find_by.subcategory = { $elemMatch: { slug: `/${subcategory}` } };

        const categoryList = await categoryModel.findOne(find_by).lean();

        const subCategory = categoryList && categoryList.subcategories.find(category => { 
            return category.slug === `/${subcategory}`;
        });
        
        const categoryName = categoryList ? categoryList._id.toString() : null;
        const subcategoryName = subCategory ? subCategory._id.toString() : null;

        if (categoryName)
            req.find_by.category = categoryName;
        if (subcategoryName)
            req.find_by.subcategory = { $in: [subcategoryName] };
    }

    next();
});

export const load_my_courses = catchAsync(async (req, res, next) => {
    if (req.session.auth || req.session.passport) {
        const my_courses = await User.findOne({ _id: res.locals.authUser._id }).select('myCourses').lean();
        req.myCourses = my_courses.myCourses;
    }
    next();
});

export const loadMyWishCourse = catchAsync(async (req, res, next) => {
    if (res.locals && res.locals.authUser) {
        const myWishCourses = await User.findOne({ _id: res.locals.authUser._id }).select("wishlist").lean();
        req.myWishCourses = myWishCourses.wishlist;
    }
    next();
})

export const loadSearch = catchAsync(async (req, res, next) => {
    if (req.query.q) {
        res.locals.q = req.query.q;
        req.find_by = { $text: { $search: req.query.q }, ...req.find_by };
    }
    next();
});