import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";

export const loadCourse = catchAsync(async (req, res, next) => {
    const { slug_course_name, slug_lesson_name } = req.params;

    let section_numer = req.query.section;

    const slug_lesson = req.originalUrl;
    const slug_course = slug_lesson.substring(0, slug_lesson.indexOf(slug_course_name) + slug_course_name.length);

    const my_course = User.findOne({ myCourses: { $in: [slug_course] } }).lean();
    
    if (!my_course || (req.session.auth === false && !req.session.passport)) {
        return res.redirect(`${slug_course}`);
    }

    const lesson_url = slug_lesson.split('?')[0];
    
    const course = await Course.findOne({ slug: slug_course }).lean();

    if (!course) {
        return res.redirect(`${slug_course}`);
    }

    let founded_lessons = null;

    if (!section_numer && slug_lesson_name) {
        course.lectures.sections.forEach((section, index) => {
            founded_lessons = section.lessons.find(lesson => lesson.url === lesson_url);
            if (founded_lessons) {
                section_numer = index + 1;
                return;
            }
        });
    }

    section_numer = (section_numer) ? section_numer : 1;

    const course_section = course.lectures.sections[section_numer - 1];
    const course_lessons = (founded_lessons) ? founded_lessons : course_section.lessons.find(lesson => lesson.url === lesson_url);

    if (!course_lessons || !slug_lesson_name) { 
        return res.redirect(`${course_section.lessons[0].url}?section=${section_numer}`);
    }

    req.course = course;
    req.watch_info = {
        section: section_numer,
        section_name: course_section.title,
        lesson: lesson_url,
        lesson_name: course_lessons.title,
        video: course_lessons.video,
        current_lesson: Buffer.from(lesson_url).toString('base64'),
        url: lesson_url,
        current_course: slug_course
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