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
export const getPreview = async (req, res, next) => {
    res.render('instructor/others', {
        layout: "instructor",
        sidebar: "my-course"
    });
}

export const getInstructorProfile = async (req, res, next) => {
}


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


export const editCourseDescription = catchAsync(async (req,res, next) => {
    // config storage
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const slug_name = slugify(req.body.course_title,{
                lower: true,
                locale: "vi"
            });

            const file_path = `public/courses/${slug_name}`;
            
            if (!fs.existsSync(file_path))
                fs.mkdirSync(file_path);
            
            cb(null, file_path)
        },
        filename: function (req, file, cb) {
            const file_ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length).split('.')[1];
            const slug_name = slugify(req.body.course_title,{
                lower: true,
                locale: "vi"
            });
            cb(null, `${slug_name}.${file_ext}`);
        }
    })   
    const upload = multer({ storage: storage });
    upload.single('courseImageFile')(req,res, async (err) => {
        res.locals.handlebars = "instructor/addCourseDescription";
        res.locals.layout = "instructor.hbs";
        if (err) console.error(err);
        else {
          // if haven't registered course yet => create new one
            if (!req.query.course) {
                const foundCourse = await Course.findOne({name: req.body.course_title});
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
                    img: req.file.path.replace('public\\', '').replaceAll('\\', '/'),
                    details: req.body.full_description,
                    slug: `/course/${slugify(req.body.course_title,{ lower: true, locale: "vi" })}`,
                    description: req.body.short_description,
                    currency: req.body.price_currency,
                    price: req.body.price_amount,
                    sale: 0,
                    finish: 0,
                    category: req.body.course_category,
                    subcategory: [req.body.course_sub_category],
                    // author: res.locals.authUser.name,
                    author: "Khoa Nguyen",
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
                // const thisInstructor = await User.findOne({_id: res.locals.authUser._id});
                // thisInstructor.myCourses.push(newCourse._id);
                // await thisInstructor.save();
                // res.locals.authUser.myCourses = thisInstructor.myCourses;
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
                // const thisInstructor = await User.findOne({_id: res.locals.authUser._id});
                // const myCourses = thisInstructor.myCourses;
                // const newCourseList = myCourses.filter((course_id) => {
                //     return course_id != req.query.course;
                // })
                // thisInstructor.myCourses = newCourseList;
                // await thisInstructor.save();
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
    res.render('instructor/addCourseContent', {
        layout: "instructor",
        sections: course.lectures.sections,
        sections_empty: true,
        url: my_url,
        course_id: course_id,
        section_id: section_id,
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
            req.course = await Course.findById({_id: req.query.course}).lean();

            const lesson_slug = slugify(req.body.lecture_title, {lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g});
            const course_slug = slugify(req.course.name, {lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g});

            if (!fs.existsSync(`public/courses/${course_slug}/${lesson_slug}`)) {
                fs.mkdirSync(`public/courses/${course_slug}/${lesson_slug}`);
            }
            
            cb(null, `public/courses/${course_slug}/${lesson_slug}`)
        },
        filename: function (req, file, cb) {
            const file_ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length).split('.')[1];
            const lesson_slug = slugify(req.body.lecture_title, {lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g});

            cb(null, `${lesson_slug}.${file_ext}`);
        }
    })   
    const upload = multer({ storage: storage });
    upload.single('videoUploadFile')(req,res, async (err) => {
        if (err) console.error(err);
        else {
            const course = req.course// find course
            const thisCourseLectures = await Course.findById({_id: req.query.course}).select('lectures');
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
                await thisCourseLectures.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
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
                    message: "success",
                    sidebar: "my-course"
                })
            }
            // if user delete section
            else if (req.body.requestActionInSection  == "delete_section") {
                const newSectionArray = thisCourseLectures.lectures.sections.filter((section) => {
                    return section._id.toString() !== req.query.section;
                })
                thisCourseLectures.lectures.sections = newSectionArray;
                await thisCourseLectures.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
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
                    await thisCourseLectures.save();
                    //return res.redirect(`/instructor/add-course-content/?course=${course._id}`);
                    return res.render('instructor/addCourseContent', {
                        layout: "instructor",
                        course_id: req.query.course,
                        message: "success",
                        sidebar: "my-course"
                    })
                }
                // if user add new lessons
                else if (req.query.section) { // user add new lessons
                    let thisSection = thisCourseLectures.lectures.sections.filter((section) => {
                        return section._id.toString() === req.query.section;
                    });
                    thisSection = thisSection[0]; // get section out of an array
                    const lecture_slug = slugify(req.body.lecture_title, {lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g});
                    const newLesson = {
                        title: req.body.lecture_title,
                        resources: [],
                        url: `${course.slug}/learn/lecture/${lecture_slug}`,
                        video: req.file.path.replace('public\\', '').replaceAll('\\', '/'),
                        preview: "",
                        _id: new mongoose.Types.ObjectId()
                    }
                    const foundLesson = thisSection.lessons.filter((lesson) => {
                        return lesson.title.toString() === newLesson.title.toString();
                    });
                    // if this lesson's title existed
                    if(foundLesson.length > 0) {
                        return res.render('instructor/addCourseContent', {
                            layout: "instructor",
                            course_id: req.query.course,
                            message: "This lesson already exists. Please choose a different lesson title.",
                            sidebar: "my-course"
                        })
                    }
                    thisSection.lessons.push(newLesson);
                    await thisCourseLectures.save();
                    //return res.redirect(`/instructor/add-course-content/?course=${course._id}`);
                    return res.render('instructor/addCourseContent', {
                        layout: "instructor",
                        course_id: req.query.course,
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
                    return lesson._id.toString() !== req.query.lesson;
                })
                thisSection.lessons = newLessonArray;
                await thisCourseLectures.save();
                return res.render('instructor/addCourseContent', {
                    layout: "instructor",
                    course_id: req.query.course,
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
                    message: "finish",
                    sidebar: "my-course"
                })
            }
            return res.redirect(`/instructor/add-course-content/?course=${course._id}`);
        }
    })
});
