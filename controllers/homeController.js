import courseModel from "../models/courseModel.js";
import User from '../models/userModel.js';
import courseDetailsModel from "../models/courseDetailsModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import courseDetails from "../models/courseDetailsModel.js";
import Category from '../models/categoryModel.js';

const loadhotCourse = async (myCourses, myWishCourses, categories, authors) => { 
    const hotCourses = await courseDetailsModel.find({ viewer: { $gt: 40000 } }).select('-reviews').sort('-viewer').limit(10).lean();
    const newcourse = [];

    let first = true;

    for (let index = 0; index < hotCourses.length; index++) {
        const hotCoursesDetails = hotCourses[index];
        const course = await courseModel.findOne({ _id: hotCoursesDetails.course_id, finish: 1, active: true }).select('-lectures.sections').lean();
        if (!course) continue;

        const new_hot_course = {
            active: first ? true : false,
            course_name: course.name,
            course_slug: course.slug,
            course_rate: hotCoursesDetails.avg_rating,
            course_vote: fixNumberFormat(hotCoursesDetails.num_reviews),
            course_viewer: fixNumberFormat(hotCoursesDetails.viewer),
            course_author: authors.find(el => el._id.toString() === course.author).name || '',
            course_price: course.price,
            course_status: "best seller",
            course_category: categories.find(el => el._id.toString() === course.category).title || '',
            course_date: fixDateFormat(course.date),
            course_img: course.img,
            course_description: course.description,
            course_duration: course.lectures.duration,
            course_lessons: course.lectures.total,
            course_id: course._id,
            my_courses: (myCourses && myCourses.includes(course._id.toString())) ? true : false,
            myWishCourses: (myWishCourses && myWishCourses.includes(course._id.toString())) ? "chosen" : ""
        }
        first = false;
        newcourse.push(new_hot_course);
    }
    return newcourse;
}

const loadNewestCourse = async (myCourses, myWishCourses, categories, authors) => {
    const date = new Date();
    const current_date = date.getTime(); 
    const prev_date = new Date(date.setMonth(date.getMonth() - 3)).getTime();

    const hotCourses = await courseDetailsModel.find({ viewer: { $gt: 40000 } }, { course_id: 1 }).sort('-viewer').limit(10).lean();
    const hotCourses_ID = hotCourses.map(el => el.course_id);

    const newestViewCourse = await courseModel.find({ 
        _id: { $nin: hotCourses_ID },
        finish: 1, 
        active: true, 
        date: {
            $gte: new Date(prev_date).toISOString(),
            $lte: new Date(current_date).toISOString()
        }
    }).select('-lectures.sections').sort('-date').limit(10).lean();
    const newcourse = [];

    for (let index = 0; index < newestViewCourse.length; index++) {
        const course = newestViewCourse[index];
        const newestCourseDetails = await courseDetailsModel.findOne({ course_id: course._id }).select('-reviews').lean();

        const newest_course = {
            active: index === 0 ? true : false,
            course_name: course.name,
            course_slug: course.slug,
            course_rate: newestCourseDetails.avg_rating,
            course_vote: fixNumberFormat(newestCourseDetails.num_reviews),
            course_viewer: fixNumberFormat(newestCourseDetails.viewer),
            course_author: authors.find(el => el._id.toString() === course.author).name || '',
            course_price: course.price,
            course_status: "new",
            course_category: categories.find(el => el._id.toString() === course.category).title || '',
            course_date: fixDateFormat(course.date),
            course_img: course.img,
            course_description: course.description,
            course_duration: course.lectures.duration,
            course_lessons: course.lectures.total,
            course_id: course._id,
            my_courses: (myCourses && myCourses.includes(course._id.toString())) ? true : false,
            myWishCourses: (myWishCourses && myWishCourses.includes(course._id.toString())) ? 'chosen' : ''
        }
        newcourse.push(newest_course);
    }
    return newcourse;
}

const loadTopCategories = async (categories) => {
    const categoriesList = JSON.parse(categories);
    const categoriesIDList = categoriesList.map((category) => category._id.toString());

    const topCategories = [];

    for (let i = 0; i < categoriesIDList.length; i++) {
        const course = await Course.find({ category: categoriesIDList[i], finish: 1, active: true }, { _id: 1 }).lean();
        const course_IDList = course.map((course) => course._id.toString());
        
        const course_Details = await courseDetails.find({ course_id: { $in: course_IDList } }).select('viewer').lean();

        const total = course_Details.reduce((total, course) => total + course.viewer, 0);

        topCategories.push({
            category_id: categoriesIDList[i],
            total: total
        });
    }
    const topCategoriesList = topCategories.sort((a, b) => b.total - a.total);
    const topCategories_ID = topCategoriesList.map((category) => category.category_id).splice(0, 5);

    const top5Categories = await Category.find({ _id: { $in: topCategories_ID } }).select('title slug').lean();
    return top5Categories;
}

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

export const homePage = catchAsync(async (req, res) => {
    res.locals.handlebars = 'home/home';

    const categories = JSON.parse(res.locals.categories);
    const authors = await User.find().select('name').lean();
    
    const mostviewCourse = await loadhotCourse(req.myCourses, req.myWishCourses, categories, authors);
    const hotCourse = mostviewCourse.slice(0, 4);

    const newestCourse = await loadNewestCourse(req.myCourses, req.myWishCourses, categories, authors);
    const topCategories = await loadTopCategories(res.locals.categories);

    res.render('home/home', { hotCourse, mostviewCourse, newestCourse, topCategories: {
        colors: ['top1gradient', 'top2gradient', 'top3gradient', 'top4gradient', 'top5gradient'],
        top: topCategories
    } });
});
