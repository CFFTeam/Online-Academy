import { NOTIMP } from "dns";
import express from "express";
import catchAsync from "../utilities/catchAsync.js";
import validateUser from '../middlewares/auth.mdw.js';
import multer from 'multer';
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import e from "express";


export const getMyCourses = function (req,res,next) {
    //res.render('instructor/my-courses.hbs');
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
        empty: list.length === 0
});
}

export const addCourseDescription = (req,res) => {
}

export const renderCourseContent = async (req,res) => {
    // if haven't registered course yet
    if (!req.query.course) res.redirect('/instructor/my-courses');
    const course = await Course.findById({_id: req.query.course}).lean();
    const thisCourseLectures = await Course.findById({_id: req.query.course}).select('lectures');
    let foundLesson = {
        title: "",
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
    // pre processing url
    let my_url = req.originalUrl;
    if (my_url.includes("&lesson")) {
       const temp_url = my_url;
       const lesson_id = temp_url.split("&lesson=").pop();
       my_url = temp_url.replace(`&lesson=${lesson_id}`, "");
    }
    const course_id = req.query.course;
    const section_id = req.query.section;
    // console.log("foundLesson: ", foundLesson);
    res.render('instructor/addCourseContent', {
        layout: "instructor",
        sections: course.lectures.sections,
        sections_empty: true,
        url: my_url,
        course_id: course_id,
        section_id: section_id,
        lesson: {
            title: foundLesson.title,
        }
    });
}


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
        if (err) { console.error(err);}
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
            }
             // if user edit  section
            else if (req.query.section && !req.body.requestAction) {
                let thisSection = thisCourseLectures.lectures.sections.filter((section) => {
                    return section._id.toString() === req.query.section;
                });
                thisSection = thisSection[0]; // get section out of an array
                thisSection.title = req.body.section_title;
                await thisCourseLectures.save();
            }
            // if user edit lesson
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
                        message: "success"
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
                    thisSection.lessons.push(newLesson);
                    await thisCourseLectures.save();
                    //return res.redirect(`/instructor/add-course-content/?course=${course._id}`);
                    return res.render('instructor/addCourseContent', {
                        layout: "instructor",
                        course_id: req.query.course,
                        message: "success"
                    })
                }
               
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