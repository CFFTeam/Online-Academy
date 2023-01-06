import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";

export const loadCourse = catchAsync(async (req, res, next) => {
    const { slug_course_name, slug_lesson_name } = req.params;
    let section_numer = req.query.section;

    const slug_lesson = req.originalUrl;
    const slug_course = slug_lesson.substring(0, slug_lesson.indexOf(slug_course_name) + slug_course_name.length);

    if (req.session.auth === false && !req.session.passport)
        return res.redirect(`${slug_course}`);

    const course = await Course.findOne({ slug: slug_course }).lean();
    if (!course)
        return res.redirect(`${slug_course}`);

    const my_course = await User.findOne({ _id: res.locals.authUser._id, myCourses: { $in: [course._id.toString()] } }).lean();
    if (!my_course)
        return res.redirect(`${slug_course}`);
    
    const lesson_url = slug_lesson.split('?')[0];
    
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
    const course_lessons = (founded_lessons) 
                            ? founded_lessons 
                            : (course_section) 
                            ? course_section.lessons.find(lesson => lesson.url && lesson.url === lesson_url) || null 
                            : null;

    if (!course_section || !course_section.lessons.length) 
        return res.redirect(`${slug_course}`);

    if (!course_lessons || !slug_lesson_name)
        return res.redirect(`${course_section.lessons[0].url}?section=${section_numer}`);

    req.course = course;
    req.watch_info = {
        section: section_numer,
        section_name: course_section.title,
        lesson: lesson_url,
        lesson_name: course_lessons.title,
        video: course_lessons.video,
        current_lesson: Buffer.from(lesson_url).toString('base64'),
        url: lesson_url,
        current_course: slug_course,
        course_sections: encodeURIComponent(JSON.stringify(course.lectures.sections))
    }

    next();
});

export const watchingCourse = catchAsync(async (req, res) => {
    res.locals.handlebars = 'learning/course_learning';

    const progress = await User.findOne({
        _id: res.locals.authUser._id,
        'my_progress.course_id': req.course._id
    }).select('my_progress');

    const progress_course_current = progress.my_progress.find(course => course.course_id === req.course._id.toString()).progress;
    
    let progressor = {};
    progress_course_current.forEach(el => (progressor = { ...progressor, [el.lesson_id]: el.status } ));

    res.render(res.locals.handlebars, {
        course: req.course,
        watch_info: req.watch_info,
        progress: progressor
    });
});

export const progressCourse = catchAsync(async (req, res) => {
    const { course_id, lesson_id, status, slug_course } = req.body;

    if (req.session.auth === false && !req.session.passport)
        return res.status(403).json({
            redirect: `${slug_course}`
        });

    const course_cur = await Course.findOne({ slug: slug_course }).lean();
    if (!course_cur)
        return res.status(403).json({
            redirect: `${slug_course}`
        });

    const my_course = await User.findOne({ _id: res.locals.authUser._id, myCourses: { $in: [course_cur._id.toString()] } }).lean();
    if (!my_course)
        return res.status(403).json({
            redirect: `${slug_course}`
        });

    const progress = await User.findOne({
        _id: res.locals.authUser._id,
        'my_progress.course_id': course_id
    }).select('my_progress');

    const course_current = progress.my_progress.find(course => course.course_id === course_id);
    
    const progress_cur = course_current.progress.find(el => el.lesson_id === lesson_id);
    progress_cur.status = status;
    
    await progress.save();

    res.status(200).json({  
        status: 'success'    
    });
});