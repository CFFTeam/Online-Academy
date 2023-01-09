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

    const course = await Course.findOne({ slug: slug_course, finish: 1, active: true }).lean();
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
    
    const next_lesson_index = course_section.lessons.findIndex(lesson => lesson.url === lesson_url) + 1;
    const next_section_index = section_numer;

    if (next_lesson_index < course_section.lessons.length)
        req.next_lesson = `${course_section.lessons[next_lesson_index].url}?section=${section_numer}`;
    else if (next_section_index < course_section.length) {
        const next_section = course.lectures.sections[next_section_index];
        req.next_lesson = `${next_section.lessons[0].url}?section=${next_section_index}`;
    } 
    else req.next_lesson = 'finished';

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
        course_sections: encodeURIComponent(JSON.stringify(course.lectures.sections)),
        next_lesson: req.next_lesson
    }

    next();
});

export const loadProgress = async (course_id, user_id) => {
    const progress = await User.findOne({
        _id: user_id,
        'my_progress.course_id': course_id
    }).select('my_progress');

    const progress_course_current = progress.my_progress.find(course => course.course_id === course_id.toString());

    if (!progress_course_current) {
        return {
            progressor: {},
            percent: 0,
            value: 0,
            total: 0
        }
    }

    const all_lesson = [];
    
    const courses = await Course.findOne({ _id: course_id });

    if (!courses) {
        progress.my_progress = progress.my_progress.filter(course => course.course_id !== course_id.toString());         
        await progress.save();
        return {
            progressor: {},
            percent: 0,
            value: 0,
            total: 0
        }
    }

    courses.lectures.sections.forEach(section => {
        section.lessons.forEach(lesson => {
            all_lesson.push(lesson._id.toString());
        });
    });

    progress_course_current.progress = all_lesson.map(el => {
        const old_lesson = progress_course_current.progress.find(el2 => el2.lesson_id === el);
        if (old_lesson) return old_lesson;
        return { 
            lesson_id: el,
            status: false 
        }
    });

    let progress_value = 0;

    progress_course_current.progress.forEach(el => {
        progress_value = el.status === true ? progress_value + 1 : progress_value 
    });

    const progress_total = courses.lectures.total;
    progress_course_current.total = progress_total;

    let progressor = {};
    progress_course_current.progress.forEach(el => (progressor = { ...progressor, [el.lesson_id]: el.status } ));

    await progress.save();

    return {
        progressor: progressor,
        percent: Math.round((progress_value / progress_total) * 100),
        value: progress_value,
        total: progress_total
    }
}

export const watchingCourse = catchAsync(async (req, res) => {
    res.locals.HTMLTitle = req.course.name;

    res.locals.handlebars = 'learning/course_learning';

    const progress = await loadProgress(req.course._id, res.locals.authUser._id);
    const author = await User.findOne({ _id: req.course.author }).select('name avatar').lean();

    res.render(res.locals.handlebars, {
        course: req.course,
        author: author,
        watch_info: req.watch_info,
        progress: progress
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
    const progress_total = course_current.total;
    
    const progress_cur = course_current.progress.find(el => el.lesson_id === lesson_id);
    if (progress_cur) progress_cur.status = status;
    
    let progress_value = 0;
    course_current.progress.forEach(el => {
        progress_value = el.status === true ? progress_value + 1 : progress_value 
    });

    await progress.save();

    const progress_percent = Math.round((progress_value / progress_total) * 100);

    res.status(200).json({  
        status: 'success',
        progress: {
            value: progress_value,
            total: progress_total,
            percent: progress_percent
        }   
    });
});

export const finishCourse = catchAsync(async (req, res) => { 
    const { slug_course_name } = req.params;

    const slug_course = `/course/${slug_course_name}`;

    if (req.session.auth === false && !req.session.passport)
        return res.redirect(`${slug_course}`);

    const course = await Course.findOne({ slug: slug_course }).lean();
    if (!course)
        return res.redirect(`${slug_course}`);

    const my_course = await User.findOne({ _id: res.locals.authUser._id, myCourses: { $in: [course._id.toString()] } });
    if (!my_course)
        return res.redirect(`${slug_course}`);

    if (!my_course.finishCourses.includes(course._id.toString()))
        my_course.finishCourses.push(course._id.toString());

    await my_course.save();

    res.redirect('/my-courses');
});