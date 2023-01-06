import courseModel from "../models/courseModel.js";
import User from '../models/userModel.js';
import courseDetailsModel from "../models/courseDetailsModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import catchAsync from "../utilities/catchAsync.js";

const loadhotCourse = async (myCourses, myWishCourses, categories, authors) => { 
    const hotCourses = await courseDetailsModel.find().select('-reviews').sort('-viewer').limit(10).lean();
    const newcourse = [];

    for (let index = 0; index < hotCourses.length; index++) {
        const hotCoursesDetails = hotCourses[index];
        const course = await courseModel.findOne({ _id: hotCoursesDetails.course_id, finish: 1, active: true }).select('-lectures.sections').lean();

        const new_hot_course = {
            active: index === 0 ? true : false,
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
        newcourse.push(new_hot_course);
    }
    return newcourse;
}

const loadNewestCourse = async (myCourses, myWishCourses, categories, authors) => {
    const newestViewCourse = await courseModel.find({ finish: 1, active: true }).select('-lectures.sections').sort('-date').limit(10).lean();
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
            myWishCourses: (myWishCourses && myWishCourses.includes(course._id.toString())) ? "chosen" : ""
        }
        newcourse.push(newest_course);
    }
    return newcourse;
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

    res.render('home/home', { hotCourse, mostviewCourse, newestCourse });
});
