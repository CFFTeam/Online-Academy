import Course from "../models/courseModel.js";
import catchAsync from "../utilities/catchAsync.js";

export const loadCourse = catchAsync(async (req, res, next) => { 
    const { slug_course_name, slug_lesson_name } = req.params;

    const section_numer = req.query.section || 1;

    const slug_lesson = req.originalUrl;
    const slug_course = slug_lesson.substring(0, slug_lesson.indexOf(slug_course_name) + slug_course_name.length);

    const lesson_url = slug_lesson.split('?')[0];
    
    const course = await Course.findOne({ slug: slug_course }).lean();

    const course_section = course.lectures.sections[section_numer - 1];
    const course_lessons = course_section.lessons.find(lesson => lesson.url === lesson_url);

    if (!course_lessons) { 
        return res.redirect(`${course_section.lessons[0].url}?section=${section_numer}`);
    }

    req.course = course;
    req.watch_info = {
        section: section_numer,
        section_name: course_section.title,
        lesson: lesson_url,
        lesson_name: course_lessons.title,
        video: course_lessons.video
    }

    next();
});

export const watchingCourse = catchAsync(async (req, res) => {
    res.locals.handlebars = 'learning/course_learning';

    res.render(res.locals.handlebars, {
        course: req.course,
        watch_info: req.watch_info
    });
});