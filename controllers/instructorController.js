import { NOTIMP } from "dns";
import express from "express";
import catchAsync from "../utilities/catchAsync.js";
import validateUser from '../middlewares/auth.mdw.js';
import multer from 'multer';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import CourseDetail from "../models/courseDetailsModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import fs from "fs";
import slugify from "slugify";

// supporting functions
const getPageList = (totalPage) => {
    const pageList = [1];
    if (totalPage > 10) {
        for (let i = 2; i <= Math.min(totalPage, 4); i++)
            pageList.push(i);
        
        pageList.push("...");

        for (let i = Math.min(totalPage - 4, 4); i >= 1; i--)
            pageList.push(totalPage - i + 1);
        }
    else 
        for (let i = 2; i <= totalPage; i++)
            pageList.push(i);
    return pageList;
};
// filter file
const fileFilter = async (req, file, cb) => {
    req.hasFile = true;
    // if add existed lesson
    if (req.query.section){
        const course = await Course.findOne({ _id: req.query.course });
        const thisCourseSection = course.lectures.sections.find((section) => {
            return section._id.toString() === req.query.section.toString();
        })
        const foundLesson = thisCourseSection.lessons.find((lesson) => {
            const slug_name = slugify(req.body.lecture_title, {
                lower: true,
                locale: "vi", strict: true
            });
            const file_name = lesson.video.substring(lesson.video.lastIndexOf('/'),lesson.video.length).split('.')[0];
            return lesson.title === req.body.lecture_title || file_name === slug_name;
        });
        if (foundLesson) {
            console.log('skipped')
            cb(null, false)
                return
        }
    }
    // if edit existed lesson
    else if (req.query.lesson) {
        const course = await Course.findOne({ _id: req.query.course });
        let foundLesson = null;
        course.lectures.sections.forEach((section) => {
            return (foundLesson = section.lessons.find((lesson) => { 
                const slug_name = slugify(req.body.lecture_title, {
                    lower: true,
                    locale: "vi", strict: true
                });
                const file_name = lesson.video.substring(lesson.video.lastIndexOf('/'),lesson.video.length).split('.')[0];
                return (lesson.title === req.body.lecture_title || file_name === slug_name) && lesson._id.toString() !== req.query.lesson.toString();
            }))
        })
        if (foundLesson) {
            console.log('skipped')
            cb(null, false)
                return
        }
    }
   
  
    cb(null, true);
}


export const getDashboard = async (req, res, next) => {
    res.render('instructor/others', {
        layout: "instructor",
        sidebar: "dash-board"
    });
}
export const getEnrolledCourses = async (req, res, next) => {
    res.render('instructor/others', {
        layout: "instructor",
        sidebar: "enrolled-courses"
    });
}
export const getWatchHistory = async (req, res, next) => {
    res.render('instructor/others', {
        layout: "instructor",
        sidebar: "watch-history"
    });
}
export const getSales = async (req, res, next) => {
    res.render('instructor/others', {
        layout: "instructor",
        sidebar: "sales"
    });
}

export const getInstructorProfile = async (req, res, next) => {
}


export const getPreview = (async (req,res) => {
    res.locals.handlebars = "instructor/coursePreview";
    res.locals.layout = "instructor.hbs";
    // if haven't registered course yet
    if (!req.query.course) {
        return res.render("instructor/addCourseDescription",{
            layout: res.locals.layout,
            message: "You need to add your course description first. Please try again!",
            sidebar: "my-course"
        });
    }
    const course = await Course.findById({_id: req.query.course}).lean();
    const thisCourseLectures = await Course.findById({_id: req.query.course}).select('lectures');
    const course_id = req.query.course;
    const section_id = req.query.section;
    // pre processing url
    let my_url = req.originalUrl;
    if (my_url.includes("&lesson")) {
       const temp_url = my_url;
       const lesson_id = temp_url.split("&lesson=").pop();
       my_url = temp_url.replace(`&lesson=${lesson_id}`, "");
    }
    let foundLesson = {
        title: ""
    };
    let section_found = {};
    if (req.query.lesson) {
        thisCourseLectures.lectures.sections.forEach(section => {
            const queryLessons = section.lessons.filter(lesson => {
                return lesson._id.toString() === req.query.lesson;
            });
            if (queryLessons[0]) {
                foundLesson = queryLessons[0];
                return;
            }
        })
        await thisCourseLectures.save();
    }
    // Pagination sections
    const page = req.query.page * 1 || 1;
    const limit = 2;
    const sections = course.lectures.sections.slice((page - 1) * limit, page * limit);
    const nPages = Math.ceil(course.lectures.sections.length / limit);
    const pageList = getPageList(nPages);
    const prev_page = +page - 1 > 0 ? +page - 1 : false;
    const next_page = +page + 1 <= nPages ? +page + 1 : false;
    res.render(res.locals.handlebars, {
        layout: res.locals.layout,
        sections: sections,
        sections_empty: true,
        url: my_url,
        course_id: course_id,
        section_id: section_id,
        pageList: pageList,
        page: page,
        prev_page: prev_page,
        next_page: next_page,
        lesson: {
            title: foundLesson.title
        },
        sidebar: "my-course"
    });
});



export const getMyCourses = async function (req,res,next) {
    //     const courseList = [
    //     {
    //         index: 1,
    //         name: "MERN Stack Real Time Chat App - React , Node , Socket IO",
    //         category: "Web Development",
    //         price: "209",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 2,
    //         name: "React - The Complete Guide (incl Hooks, React Router, Redux)",
    //         category: "Web Development",
    //         price: "99",
    //         date: "2022-12-31",
    //         finish: 0
    //     },
    //     {
    //         index: 3,
    //         name: "React - The Complete Guide (incl Hooks, React Router, Redux)",
    //         category: "Web Development",
    //         price: "150",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 4,
    //         name: "React - The Complete Guide (incl Hooks, React Router, Redux)",
    //         category: "Web Development",
    //         price: "80",
    //         date: "2022-12-31",
    //         finish: 0
    //     },
    //     {
    //         index: 5,
    //         name: "The Complete 2023 Web Development Bootcamp",
    //         category: "Web Development",
    //         price: "90",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 6,
    //         name: "The Complete 2023 Web Development Bootcamp",
    //         category: "Web Development",
    //         price: "90",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 7,
    //         name: "The Complete 2023 Web Development Bootcamp",
    //         category: "Web Development",
    //         price: "90",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 8,
    //         name: "The Complete 2023 Web Development Bootcamp",
    //         category: "Web Development",
    //         price: "90",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 9,
    //         name: "The Complete 2023 Web Development Bootcamp",
    //         category: "Web Development",
    //         price: "90",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 10,
    //         name: "The Complete 2023 Web Development Bootcamp",
    //         category: "Web Development",
    //         price: "90",
    //         date: "2022-12-31",
    //         finish: 1
    //     },
    //     {
    //         index: 11,
    //         name: "The Complete 2023 Web Development Bootcamp",
    //         category: "Web Development",
    //         price: "90",
    //         date: "2022-12-31",
    //         finish: 1
    //     }
    // ]
    let courseList = [];
    let index = 1;
    if (res.locals.authUser.myCourses.length > 0) {
        for (const course_id of res.locals.authUser.myCourses) {
            const thisCourse = await Course.findOne({_id: course_id}).lean();
            if (thisCourse) {
                thisCourse.index = index;
                courseList.push(thisCourse);
                index++;
            }
        }
    }
    res.render('instructor/myCourses', {
        layout: "instructor",
        courseList: courseList,
        empty: courseList.length === 0,
        sidebar: "my-course"
    });
}

export const getCourseDescription = catchAsync(async (req,res) => {
    const Categories = await Category.find({}).lean();
    let thisCourse = {};
    if (req.query.course) {
        thisCourse = await Course.findOne({_id: req.query.course}).lean();
    }
    res.render('instructor/addCourseDescription', {
        layout: "instructor",
        categoryList: Categories,
        js_categories: JSON.stringify(Categories),
        url: req.originalUrl,
        course_id: thisCourse._id,
        course: thisCourse,
        sidebar: "my-course"
        }
    );
});


export const editCourseDescription = catchAsync(async (req,res) => {
    // config storage
    const storage = multer.diskStorage({
        destination: async function (req, file, cb) {
            req.hasFile = true;
            if (!req.query.course) {

                const slug_name = slugify(req.body.course_title, {
                    lower: true,
                    locale: "vi", strict: true
                });
                
                const file_path = `public/courses/${slug_name}`;
                
                if (!fs.existsSync(file_path))
                    fs.mkdirSync(file_path);
                
                cb(null, file_path)
            }
            else {
                const course = await Course.findById({_id: req.query.course}).lean();
                const file_path = `public/${course.img.substring(0, course.img.lastIndexOf('/'))}`;
                req.filename = course.img.substring(course.img.lastIndexOf('/') + 1, course.img.length);
                
                cb(null, file_path)
            }
        },
        filename: function (req, file, cb) {
            const file_ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length).split('.')[1];
            if (!req.query.course) {
                const slug_name = slugify(req.body.course_title, {
                    lower: true,
                    locale: "vi", strict: true
                });
                cb(null, `${slug_name}.${file_ext}`);
            }
            else {
                const only_filename = req.filename.substring(0, req.filename.lastIndexOf('.'));
                cb(null, `${only_filename}.${file_ext}`);
            }
        }
    });
       
    const upload = multer({ storage: storage });
    upload.single('courseImageFile')(req,res, async (err) => {
        res.locals.handlebars = "instructor/addCourseDescription";
        res.locals.layout = "instructor.hbs";
        if (err) console.error(err);
        else {
          // if haven't registered course yet => create new one
            if (!req.query.course) {
                const foundCourse = await Course.findOne({name: req.body.course_title});
                // if user does not upload file
                if (!req.hasFile) {
                    return res.render(res.locals.handlebars, {
                        layout: res.locals.layout,
                        message: "You need to upload your image.",
                        sidebar: "my-course"
                    });
                }
                // if this course title already exists
                if (foundCourse) {
                    return res.render(res.locals.handlebars, {
                        layout: res.locals.layout,
                        message: "This course already exists. Please choose a different course.",
                        sidebar: "my-course"
                    });
                }
                // if user delete empty course
                if (req.body.requestActionInDescription == "delete_course_description") {
                    return res.render(res.locals.handlebars, {
                        layout: res.locals.layout,
                        message: "You can not delete an empty course.",
                        sidebar: "my-course"
                    });
                }
                // create new course
                const newCourse = await Course.create({
                    name: req.body.course_title,
                    img: `/${req.file.path.replace('public\\', '').replaceAll('\\', '/')}`,
                    details: req.body.full_description,
                    slug: `/course/${slugify(req.body.course_title,{ lower: true, locale: "vi", strict: true })}`,
                    description: req.body.short_description,
                    currency: req.body.price_currency,
                    price: req.body.price_amount,
                    sale: 0,
                    finish: 0,
                    category: req.body.course_category,
                    subcategory: [req.body.course_sub_category],
                    author: res.locals.authUser.name,
                    // author: "Khoa Nguyen",
                    date: new Date().toJSON(),
                    lectures: {
                        total: 0,
                        duration: "",
                        sections: []
                    }
                })
                // create course detail based on course id
                await CourseDetail.create({
                    course_id: newCourse._id,
                    viewer: 0,
                    avg_rating: 0,
                    num_reviews: 0,
                    reviews: []
                })
                // add new course_id in my_course field
                const thisInstructor = await User.findOne({_id: res.locals.authUser._id});
                thisInstructor.myCourses.push(newCourse._id);
                await thisInstructor.save();
                res.locals.authUser.myCourses = thisInstructor.myCourses;
                return res.render('instructor/addCourseDescription',{
                    layout: res.locals.layout,
                    course_id: newCourse._id,
                    message: "successAdded",
                    sidebar: "my-course"
                });
            }
          // if registered course => edit course description
            else {
                if (req.body.requestActionInDescription == "save_course_description") { // save course description
                const thisCourse = await Course.findOne({_id: req.query.course});
                let subcategory = [];
                if (req.body.course_sub_category !== null && req.body.course_sub_category !== undefined) {
                    subcategory = [...thisCourse.subcategory, req.body.course_sub_category];
                }
                else subcategory = [...thisCourse.subcategory];

                await Course.findByIdAndUpdate(req.query.course, {
                    name: req.body.course_title,
                    img: (req.file && req.file.path) ? req.file.path.replace('public\\', '/').replaceAll('\\', '/') : thisCourse.img,
                    details: req.body.full_description,
                    description: req.body.short_description,
                    currency: req.body.price_currency,
                    price: req.body.price_amount,
                    category: req.body.course_category,
                    subcategory: subcategory 
                })

                return res.render('instructor/addCourseDescription',{
                    layout: res.locals.layout,
                    course_id: req.query.course,
                    message: "successSaved",
                    sidebar: "my-course"
                });
               }
               else if (req.body.requestActionInDescription == "delete_course_description") { // delete 
                // delete this course
                await Course.deleteOne({_id: req.query.course});
                // delete course_id in course detail
                await CourseDetail.deleteOne({course_id: req.query.course});
                // delete course_id in my_course field
                const thisInstructor = await User.findOne({_id: res.locals.authUser._id});
                const myCourses = thisInstructor.myCourses;
                const newCourseList = myCourses.filter((course_id) => {
                    return course_id != req.query.course;
                })
                thisInstructor.myCourses = newCourseList;
                await thisInstructor.save();
                res.locals.authUser.myCourses = newCourseList;
                return res.render('instructor/addCourseDescription',{
                    layout: res.locals.layout,
                    message: "successDeleted",
                    sidebar: "my-course"
                });
               }
            }
        }
    });
});


export const getCourseContent = catchAsync(async (req,res) => {
    res.locals.handlebars = "instructor/addCourseContent";
    res.locals.layout = "instructor.hbs";
    // if haven't registered course yet
    if (!req.query.course) {
        return res.render('instructor/addCourseContent',{
            layout: res.locals.layout,
            message: "You need to add your course description first. Please try again!",
            sidebar: "my-course"
        });
    }
   
    const course = await Course.findById({_id: req.query.course}).lean();
    const thisCourseLectures = await Course.findById({_id: req.query.course}).select('lectures');
    const course_id = req.query.course;
    const section_id = req.query.section;
    // pre processing url
    let my_url = req.originalUrl;
    if (my_url.includes("&lesson")) {
       const temp_url = my_url;
       const lesson_id = temp_url.split("&lesson=").pop();
       my_url = temp_url.replace(`&lesson=${lesson_id}`, "");
    }
    let foundLesson = {
        title: ""
    };
    let section_found = {};
    if (req.query.lesson) {
        thisCourseLectures.lectures.sections.forEach(section => {
            const queryLessons = section.lessons.filter(lesson => {
                return lesson._id.toString() === req.query.lesson;
            });
            if (queryLessons[0]) {
                foundLesson = queryLessons[0];
                return;
            }
        })
        await thisCourseLectures.save();
    }
    // Pagination sections
    const page = req.query.page * 1 || 1;
    const limit = 2;
    const sections = course.lectures.sections.slice((page - 1) * limit, page * limit);
    const nPages = Math.ceil(course.lectures.sections.length / limit);
    const pageList = getPageList(nPages);
    const prev_page = +page - 1 > 0 ? +page - 1 : false;
    const next_page = +page + 1 <= nPages ? +page + 1 : false;
    res.render('instructor/addCourseContent', {
        layout: "instructor",
        // sections: course.lectures.sections,
        sections: sections,
        sections_empty: true,
        url: my_url,
        course_id: course_id,
        section_id: section_id,
        pageList: pageList,
        page: page,
        prev_page: prev_page,
        next_page: next_page,
        lesson: {
            title: foundLesson.title
        },
        sidebar: "my-course"
    });
});


export const editCourseContent = catchAsync(async(req,res,next) => {
    res.locals.handlebars = "instructor/addCourseContent";
    res.locals.layout = "instructor.hbs";

    // config storage
    const storage = multer.diskStorage({
        destination: async function(req, file, cb) {
            req.hasFile = true;
            if (!req.query.lesson && req.query.section) { // add new lesson
                req.course = await Course.findById({_id: req.query.course}).lean();
                const thisSection = req.course.lectures.sections.find(section => section._id.toString() === req.query.section.toString());
                const section_dir = slugify(thisSection.title, {lower: true, locale: 'vi', strict: true });
                const course_slug = req.course.slug.replace('/course/', '/courses/');                
                if (!fs.existsSync(`public/${course_slug}/${section_dir}`)) {
                    fs.mkdirSync(`public${course_slug}/${section_dir}`);
                }
                cb(null, `public${course_slug}/${section_dir}`)
            }
            else if (req.query.lesson) { // edit lesson
                let foundLesson = {}; // find that lesson
                req.thisCourseLectures = await Course.findById({_id: req.query.course}).select('lectures');
                req.thisCourseLectures.lectures.sections.forEach(section => {
                    const queryLessons = section.lessons.filter(lesson => {
                        return lesson._id.toString() === req.query.lesson;
                    });
                    if (queryLessons[0]) {
                        foundLesson = queryLessons[0];
                        return;
                    }
                })
                const file_path = foundLesson.video.substring(0, foundLesson.video.lastIndexOf('/'));
                req.filepath = `public${file_path}`;
                req.filename = foundLesson.video.substring(foundLesson.video.lastIndexOf('/'), foundLesson.video.length);
                cb(null, `public${file_path}`);
            }
        },
        filename: function (req, file, cb) {
            const file_ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length).split('.')[1];
            if (!req.query.lesson && req.query.section) {
                const lesson_slug = slugify(req.body.lecture_title, {lower: true, locale: 'vi', strict: true});

                cb(null, `${lesson_slug}.${file_ext}`);
            }
            else if (req.query.lesson) {
                const only_name = req.filename.substring(0, req.filename.lastIndexOf('.'));
                cb(null, `${only_name}.${file_ext}`);
            }
        }
    })   
    const upload = multer({ fileFilter: fileFilter, storage: storage});
    upload.single('videoUploadFile')(req,res, async (err) => {
        if (err) console.error(err);
        else {
            const course = req.course ? req.course : await Course.findById({_id: req.query.course}).lean();
            const thisCourseLectures = (req.thisCourseLectures) ? req.thisCourseLectures : await Course.findById({_id: req.query.course}).select('lectures');
            const thisCourseSlug = await Course.findById({_id: req.query.course}).select('slug');
            const limit = 2; // limit sections (pagination)
            // if user add new section
            if (req.query.section == "") {
                let thisCourseSections = thisCourseLectures.lectures.sections;
                const newSection = {
                    title: "New Section",
                    total: 0,
                    duration: "0h 0m",
                    lessons: []
                }
                thisCourseSections.push(newSection);
                const nPages = Math.ceil(thisCourseSections.length / limit); // also last pages
                await thisCourseLectures.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
                    page: nPages,
                    message: "success",
                    sidebar: "my-course"
                })
            }
             // if user edit  section
            else if (req.body.requestActionInSection  == 'save_section') {
                let thisSection = thisCourseLectures.lectures.sections.filter((section) => {
                    return section._id.toString() === req.query.section;
                });
                thisSection = thisSection[0]; // get section out of an array
                thisSection.title = req.body.section_title; 
                await thisCourseLectures.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
                    page: req.query.page,
                    message: "success",
                    sidebar: "my-course"
                })
            }
            // if user delete section
            else if (req.body.requestActionInSection  == "delete_section") {
                const newSectionArray = thisCourseLectures.lectures.sections.filter((section) => {
                    if (section._id.toString() == req.query.section.toString()) {
                        const course_slug = thisCourseSlug.slug.replace('/course/', '');
                        const section_dir = slugify(section.title, {lower: true, locale: 'vi', strict: true });
                        const folderPath = `public/courses/${course_slug}/${section_dir}`;
                        if (fs.existsSync(folderPath)) {
                            fs.rmSync(folderPath, { recursive: true});
                        }
                    }
                    return section._id.toString() !== req.query.section.toString();
                })
                const nPagesCurrent = Math.ceil(newSectionArray.length / limit);
                const page = nPagesCurrent < req.query.page ? Math.max(nPagesCurrent,1) : req.query.page;
                thisCourseLectures.lectures.sections = newSectionArray;
                await thisCourseLectures.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
                    page: page,
                    message: "success",
                    sidebar: "my-course"
                })
            }
            // if user edit course content
            if (req.body.requestAction === "publish") {
                if (req.query.lesson) {  // edit lesson
                    let foundLesson = {}; // find that lesson
                    thisCourseLectures.lectures.sections.forEach(section => {
                        const queryLessons = section.lessons.filter(lesson => {
                            return lesson._id.toString() === req.query.lesson;
                        });
                        if (queryLessons[0]) {
                            foundLesson = queryLessons[0];
                            return;
                        }
                    })
                    if (req.body.lecture_title != "") foundLesson.title = req.body.lecture_title;
                    foundLesson.video = (req.file && req.file.path) ? `/${req.file.path.replace('public\\', '').replaceAll('\\', '/')}` : foundLesson.video;
                    await thisCourseLectures.save();
                    return res.render('instructor/addCourseContent', {
                        layout: "instructor",
                        course_id: req.query.course,
                        page: req.query.page,
                        message: "success",
                        sidebar: "my-course"
                    })
                }
                // if user add new lessons
                else if (req.query.section) { // user add new lessons
                    if (!req.hasFile) {
                        return res.render('instructor/addCourseContent', {
                            layout: "instructor",
                            course_id: req.query.course,
                            page: req.query.page,
                            message: "You must add video of this lesson. Try again later!",
                            sidebar: "my-course"
                        })
                    }
                    let thisSection = thisCourseLectures.lectures.sections.filter((section) => {
                        return section._id.toString() === req.query.section;
                    });
                    thisSection = thisSection[0]; // get section out of an array
                    const lecture_slug = slugify(req.body.lecture_title, {lower: true, locale: 'vi', strict: true});
                    const newLesson = {
                        title: req.body.lecture_title,
                        resources: [],
                        url: `${course.slug}/learn/lecture/${lecture_slug}`,
                        video: req.file && req.file.path ? `/${req.file.path.replace('public\\', '').replaceAll('\\', '/')}` : "",
                        preview: "",
                        _id: new mongoose.Types.ObjectId()
                    }
                    // const foundLesson = thisSection.lessons.filter((lesson) => {
                    //     return lesson.url.toString() === newLesson.url.toString();
                    // });
                    // if this lesson's title existed
                    const foundLesson = thisSection.lessons.find((lesson) => {
                        const slug_name = slugify(req.body.lecture_title, {
                            lower: true,
                            locale: "vi", strict: true
                        });
                        const file_name = lesson.video.substring(lesson.video.lastIndexOf('/'),lesson.video.length).split('.')[0];
                        return lesson.title === req.body.lecture_title || file_name === slug_name;
                    });
                    if(foundLesson) {
                        return res.render('instructor/addCourseContent', {
                            layout: "instructor",
                            course_id: req.query.course,
                            page: req.query.page,
                            message: "This lesson already exists. Please choose a different lesson title.",
                            sidebar: "my-course"
                        })
                    }
                    thisSection.lessons.push(newLesson);
                    await thisCourseLectures.save();
                    return res.render('instructor/addCourseContent', {
                        layout: "instructor",
                        course_id: req.query.course,
                        page: req.query.page,
                        message: "success",
                        sidebar: "my-course"
                    })
                }
               
            }
            else if (req.body.requestAction === "delete_lesson") { // if user delete a lesson
                let thisSection = thisCourseLectures.lectures.sections.filter((section) => {
                    return section._id.toString() === req.query.section;
                });
                thisSection = thisSection[0]; // get section out of an array
                const newLessonArray = thisSection.lessons.filter((lesson) => {
                    if (lesson._id.toString() == req.query.lesson) {
                        const videoPath = `public${lesson.video}`;
                        fs.rmSync(videoPath);
                    }
                    return lesson._id.toString() !== req.query.lesson;
                })
                thisSection.lessons = newLessonArray;
                await thisCourseLectures.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
                    page: req.query.page,
                    message: "success",
                    sidebar: "my-course"
                })
            }
             // if user finish the course
            else if (req.body.requestAction === "finish") {
                const thisCourse = await Course.findById(req.query.course);
                thisCourse.finish = 1;
                await thisCourse.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
                    page: req.query.page,
                    message: "finish",
                    sidebar: "my-course"
                })
            }
            return res.redirect(`/instructor/add-course-content/?course=${course._id}`);
        }
    })
});
