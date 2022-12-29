import Course from "../models/courseModel.js";
import catchAsync from "../utilities/catchAsync.js";

export const watchingCourse = catchAsync(async (req, res) => {
    const { slug_course_name, slug_lesson_name } = req.params;
    res.locals.handlebars = 'learning/course_learning';

    const slug_lesson = req.originalUrl;
    const slug_course = slug_lesson.substring(0, slug_lesson.indexOf(slug_course_name) + slug_course_name.length);

    const course = await Course.findOne({ slug: slug_course }).lean();

    res.render(res.locals.handlebars, {
        course: course
    });
});