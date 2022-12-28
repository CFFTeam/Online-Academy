import courseModel from "../models/courseModel.js";
import courseDetailsModel from "../models/courseDetailsModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import catchAsync from "../utilities/catchAsync.js";

const loadhotCourse = async () => {
    const hotCourses = await courseDetailsModel.find().select('-reviews').sort('-viewer').limit(10).lean();
    const newcourse = [];

    for (let index = 0; index < hotCourses.length; index++) {
        const hotCoursesDetails = hotCourses[index];
        const course = await courseModel.findOne({ _id: hotCoursesDetails.course_id }).select('-lectures.sections').lean();
        
        const new_hot_course = {
            active: index === 0 ? true : false,
            course_name: course.name,
            course_rate: hotCoursesDetails.avg_rating,
            course_vote: fixNumberFormat(hotCoursesDetails.num_reviews),
            course_viewer: fixNumberFormat(hotCoursesDetails.viewer),
            course_author: course.author,
            course_price: course.price,
            course_status: "best seller",
            course_category: course.category,
            course_date: fixDateFormat(course.date),
            course_img: course.img,
            course_description: course.description,
            course_duration: course.lectures.duration,
            course_lessons: course.lectures.total
        }
        newcourse.push(new_hot_course);
    }
    return newcourse;
}

const loadNewestCourse = async () => {
    const newestViewCourse = await courseModel.find().select('-lectures.sections').sort('-date').limit(10).lean();
    const newcourse = [];
    
    for (let index = 0; index < newestViewCourse.length; index++) {
        const course = newestViewCourse[index];
        const newestCourseDetails = await courseDetailsModel.findOne({ course_id: course._id }).select('-reviews').lean();

        const newest_course = {
            active: index === 0 ? true : false,
            course_name: course.name,
            course_rate: newestCourseDetails.avg_rating,
            course_vote: fixNumberFormat(newestCourseDetails.num_reviews),
            course_viewer: fixNumberFormat(newestCourseDetails.viewer),
            course_author: course.author,
            course_price: course.price,
            course_status: "new",
            course_category: course.category,
            course_date: fixDateFormat(course.date),
            course_img: course.img,
            course_description: course.description,
            course_duration: course.lectures.duration,
            course_lessons: course.lectures.total
        }
        newcourse.push(newest_course);
    }
    return newcourse;
}

export const homePage = catchAsync(async (req, res) => {
    res.locals.handlebars = 'home/home';

    const mostviewCourse = await loadhotCourse();
    const hotCourse = mostviewCourse.slice(0, 4);
    
    const newestCourse = await loadNewestCourse();

    res.render('home/home', { hotCourse, mostviewCourse, newestCourse });
});
