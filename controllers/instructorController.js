import { NOTIMP } from "dns";
import express from "express";
import catchAsync from "../utilities/catchAsync.js";
import validateUser from '../middlewares/auth.mdw.js';
import multer from 'multer';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import Category from "../models/categoryModel.js";


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


export const getMyCourses = function (req,res,next) {
    const list = [
        {
            id: 1,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 2,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 3,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 4,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 5,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 6,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 7,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 8,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        },
        {
            id: 9,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 0
        },
        {
            id: 10,
            title: "The Complete 2023 Web Development Bootcamp",
            category: "Web Development",
            price: {
                currency: "$",
                amount: "99"
            },
            date_released: "2022-12-31",
            finish: 1
        }
    ]
    res.render('instructor/myCourses', {
        layout: "instructor",
        course_list: list,
        empty: list.length === 0,
        sidebar: "my-course"
    });
}

export const getCourseDescription = catchAsync(async (req,res) => {
    const Categories = await Category.find({}).lean();
    res.render('instructor/addCourseDescription', {
        layout: "instructor",
        categoryList: Categories,
        js_categories: JSON.stringify(Categories),
        url: req.originalUrl,
        sidebar: "my-course"
        },
    );
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
        //res.redirect('/instructor/add-course-description');
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
        destination: function (req, file, cb) {
        cb(null, `./public/tmp/my-uploads`)
        },
        filename: function (req, file, cb) {
        cb(null, file.originalname);
        }
    })   
    const upload = multer({ storage: storage });
    upload.single('videoUploadFile')(req,res, async (err) => {
        if (err) console.error(err);
        else {
            const course = await Course.findById({_id: req.query.course}).lean(); // find course
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
                    const newLesson = {
                        title: req.body.lecture_title,
                        resources: [],
                        url: "",
                        video: "",
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
                // coding later...
            }
            return res.redirect(`/instructor/add-course-content/?course=${course._id}`);
        }
    })
});


// const lectures_empty = {
//     sections: [
//     ]
// };
// const lectures = {
//     sections: [
//         {
//             title: "Section 1", 
//             lessons:[
//                 {
//                     title: "About the course"
//                 },
//                 {
//                     title: "What You'll Get in This Course"
//                 },
//                 {
//                     title: "Download the course syllabus"
//                 },
//                 {
//                     title: "Prepare your workspace"
//                 }
//             ]
//         },
//         {
//             title: "Section 2",
//             lessons:[
//                 {
//                     title: "About the course"
//                 },
//                 {
//                     title: "What You'll Get in This Course"
//                 },
//                 {
//                     title: "Download the course syllabus"
//                 },
//                 {
//                     title: "Prepare your workspace"
//                 }
//             ]
//         },
//         {
//             title: "Section 3",
//             lessons:[
//             ]
//         }
//     ]
// };