import catchAsync from "../utilities/catchAsync.js";
import multer from 'multer';
import path from "path";
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
const videoFilter = async (req, file, cb) => {
    req.hasFile = true;
    const ext_file = path.extname(file.originalname); // validate file extension
    
    req.validVideo = (/\.(mp4|mkv)$/).test(ext_file);
    if (!req.validVideo) return cb(null, false);
    // if add existed lesson
    if (req.query.section) {
        const course = await Course.findOne({ _id: req.query.course });
        const thisCourseSection = course.lectures.sections.find((section) => {
            return section._id.toString() === req.query.section.toString();
        })
        const foundLesson = thisCourseSection.lessons.find((lesson) => {
            const slug_name = slugify(req.body.lecture_title, {
                lower: true,
                locale: "vi", strict: true
            });
            const file_name = lesson.video.substring(lesson.video.lastIndexOf('/'), lesson.video.length).split('.')[0];
            return lesson.title === req.body.lecture_title || file_name === slug_name;
        });
        if (foundLesson) {
            // console.log('skipped')
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
                const file_name = lesson.video.substring(lesson.video.lastIndexOf('/'), lesson.video.length).split('.')[0];
                return (lesson.title === req.body.lecture_title || file_name === slug_name) && lesson._id.toString() !== req.query.lesson.toString();
            }))
        })
        if (foundLesson) {
            // console.log('skipped')
            cb(null, false)
            return
        }
    }


    cb(null, true);
}

const fileFilter = async (req, file, cb) => {
    req.hasFile = true;
    const ext_file = path.extname(file.originalname); // validate file extension
    req.validFile = (/\.(jpg|png|jpeg|gif)$/).test(ext_file);
    if (!req.validFile) return cb(null, false);
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
    let user = null;
    if (res.locals && res.locals.authUser) {
        user = await User.findOne({ _id: res.locals.authUser._id }).lean();
    }
    res.locals.page = "overview"
    res.locals.name = user.name;
    res.locals.birthday = user.birthday;
    res.locals.sex = user.sex;
    res.locals.phoneNumber = user.phoneNumber;
    res.locals.email = user.email;
    res.locals.address = user.address;
    res.locals.description = user.description;
    res.locals.HTMLTitle = 'Profile';
    
    res.render('instructor/myProfile', {
        layout: "instructor",
        sidebar: "user-profile",
        user: user
    });
}

export const updateInstructorProfile = async (req, res, next) => {
    const submitForm = req.body.submitForm;
    const user = await User.findOne({ _id: res.locals.authUser._id });
    const renderUser = {
        name: user.name,
        birthday: user.birthday,
        sex: user.sex,
        phone: user.phoneNumber,
        email: user.email,
        address: user.address,
        introduction: user.description
    };

    res.locals.props = {
        historyName: req.body.fullname,
        historyBirthday: req.body.dob,
        historySex: req.body.sex,
        historyPhone: req.body.phonenumber,
        historyEmail: req.body.email,
        historyAddress: req.body.address
    }

    res.locals.name = res.locals.props.historyName != null ? res.locals.props.historyName : renderUser.name;
    res.locals.birthday = res.locals.props.historyBirthday != null ? res.locals.props.historyBirthday : renderUser.birthday;
    res.locals.sex = res.locals.props.historySex != null ? res.locals.props.historySex : renderUser.sex;
    res.locals.phoneNumber = res.locals.props.historyPhone != null ? res.locals.props.historyPhone : renderUser.phone;
    res.locals.email = res.locals.props.historyEmail != null ? res.locals.props.historyEmail : renderUser.email;
    res.locals.address = res.locals.props.historyAddress != null ? res.locals.props.historyAddress : renderUser.address;

    res.locals.HTMLTitle = 'Profile';

    if (submitForm == "editProfile") {
        res.locals.handlebars = "instructor/myProfile";
        res.locals.layout = "instructor"
        res.locals.sidebar = "user-profile";

        const { fullname, dob, sex, phonenumber, email, address } = req.body;

        user.name = fullname;
        user.birthday = dob;
        user.sex = sex;
        user.phoneNumber = phonenumber;
        user.email = email;
        user.address = address;



        res.locals.page = 'editform';

        if (
            user.name === '' ||
            user.email === '' ||
            user.phoneNumber === '' ||
            user.address === '' ||
            user.sex === '' ||
            user.birthday === ''
        ) {
            return next(new Error('Please provide all fields!', 400));
        }

        // check valid name
        // const regex =
        //     /^([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]|[a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])*(?:[ ][A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/g;

        // if (!regex.exec(user.name)) return next(new Error('Your name is not valid', 400));

        // check birthday
        const regex_b =
            /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g;
        if (!regex_b.exec(user.birthday)) return next(new Error('Your birthday is not valid', 400));

        // check phone number
        const regex_p = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
        if (!regex_p.exec(user.phoneNumber)) return next(new Error('Your phone number is not valid', 400));

        // check name & address length
        if (user.name.length >= 50 || user.address.length >= 50)
            return next(new Error('User information is too long. Please enter less than 50 characters'));

        const foundUser = await User.findOne({ email: req.body.email });
        if (foundUser && foundUser.email == req.body.email && foundUser._id != res.locals.authUser._id) return next(new Error("This email already exists. Please try again."));

        // check gender
        const gender = ['Male', 'Female', 'Other'];
        if (!gender.includes(user.sex)) return next(new Error('Sex does not exist'));

        await user.save();

        res.locals.name = res.locals.props.historyName
        res.locals.birthday = res.locals.props.historyBirthday
        res.locals.sex = res.locals.props.historySex
        res.locals.phoneNumber = res.locals.props.historyPhone
        res.locals.email = res.locals.props.historyEmail
        res.locals.address = res.locals.props.historyAddress

        res.render('instructor/myProfile', {
            layout: "instructor",
            page: 'editform',
            sidebar: "user-profile",
            messages: "profile success",
            user: user
        });
    }
    else if (submitForm == "editPassword") {
        res.locals.handlebars = "instructor/myProfile";
        res.locals.layout = "instructor";
        res.locals.page = 'changeform';
        res.locals.sidebar = "user-profile";
        res.locals.users = { historyCurrentPassword: req.body.currentPassword, historyPassword: req.body.password, historyConfirmPassword: req.body.passwordConfirm };
        // 1) Get user from collection
        const user = await User.findById(res.locals.authUser._id).select('+password');
        // 2) Check if POSTed current password is correct
        if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
            return next(new Error('Your current password is wrong'), 401);
        }
        // 3) If so, update password
        if (req.body.password.length == 0) {
            return next(new Error('Password is empty'), 401);
        }
        // 6) If so, update password
        if (req.body.password.length < 8) {
            return next(new Error('Password is shorter than 8 character'), 401);
        }
        // 5) If so, update password
        if (req.body.password != req.body.passwordConfirm) {
            return next(new Error('Password and password confirm not equal'), 401);
        }
        user.password = req.body.password;
        await user.save();
        res.locals.users = { historyCurrentPassword: "", historyPassword: "", historyConfirmPassword: "" };
        res.render('instructor/myProfile', {
            layout: "instructor",
            page: 'changeform',
            sidebar: "user-profile",
            messages: "success"
        });
    }
    else if (submitForm == "editIntroduction") {
        res.locals.handlebars = "instructor/myProfile";
        res.locals.layout = "instructor";
        res.locals.page = 'introductionform';
        res.locals.sidebar = "user-profile";
        res.locals.description = req.body.full_introduction
        await User.updateOne(
            { _id: res.locals.authUser._id },
            { description: req.body.full_introduction }
        )
        res.render('instructor/myProfile', {
            layout: "instructor",
            page: 'introductionform',
            sidebar: "user-profile",
            messages: "introduction success"
        });
    }
}

export const getPreview = (async (req, res) => {
    res.locals.handlebars = "instructor/coursePreview";
    res.locals.layout = "instructor.hbs";
    res.locals.HTMLTitle = 'Preview';
    // if haven't registered course yet
    if (!req.query.course) {
        return res.render("instructor/addCourseDescription", {
            layout: res.locals.layout,
            message: "You need to add your course description first. Please try again!",
            sidebar: "my-course"
        });
    }
    const course = await Course.findById({ _id: req.query.course }).lean();
    const thisCourseLectures = await Course.findById({ _id: req.query.course }).select('lectures');
    const course_id = req.query.course;
    const section_id = req.query.section;
    // pre processing url
    let my_url = req.originalUrl;
    if (my_url.includes("&lesson")) {
        const temp_url = my_url;
        const lesson_id = temp_url.split("&lesson=").pop();
        my_url = temp_url.replace(`&lesson=${lesson_id}`, "");
    }
    let foundLesson = null;
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
            title: foundLesson ? foundLesson.title : "",
            _id: foundLesson ? foundLesson.id : "",
            video: foundLesson ? foundLesson.video : ""
        },
        sidebar: "my-course"
    });
});



export const getMyCourses = async function (req, res, next) {
    let courseList = [];
    let index = 1;
    if (res.locals.authUser.myCourses.length > 0) {
        const categories = await Category.find({}).lean();
        for (const course_id of res.locals.authUser.myCourses) {
            const thisCourse = await Course.findOne({ _id: course_id }).lean();
            if (thisCourse) {
                thisCourse.index = index;
                const thisCourseCategory = categories.find((el) => el._id.toString() === thisCourse.category.toString());
                thisCourse.category_title = thisCourseCategory.title;
                courseList.push(thisCourse);
                index++;
            }
        }
    }
    res.locals.HTMLTitle = 'All courses';
    res.render('instructor/myCourses', {
        layout: "instructor",
        courseList: courseList,
        empty: courseList.length === 0,
        sidebar: "my-course"
    });
}

export const getCourseDescription = catchAsync(async (req, res) => {
    res.locals.HTMLTitle = 'Add new course';

    const Categories = await Category.find({}).lean();
    let thisCourse = {};
    let urCourseSubcategory = [];
    let urCourseCategory;

    if (req.query.course) {
        thisCourse = await Course.findOne({ _id: req.query.course }).lean();
        urCourseCategory = await Category.findOne({_id: thisCourse.category}).lean();
        for (const subcategory of thisCourse.subcategory) {
            let sub_cat = urCourseCategory.subcategories.find((el) => el._id == subcategory);
            urCourseSubcategory.push(sub_cat.content);
        }
    }
    res.render('instructor/addCourseDescription', {
        layout: "instructor",
        categoryList: Categories,
        js_categories: JSON.stringify(Categories),
        url: req.originalUrl,
        course_id: thisCourse._id,
        course: thisCourse,
        urCourseCategory: urCourseCategory ? urCourseCategory.title : "",
        urCourseSubCategory: urCourseSubcategory ? urCourseSubcategory : [],
        sidebar: "my-course"
    }
    );
});


export const editCourseDescription = catchAsync(async (req, res) => {
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
                const course = await Course.findById({ _id: req.query.course }).lean();
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

    const upload = multer({ fileFilter: fileFilter, storage: storage });
    upload.single('courseImageFile')(req, res, async (err) => {
        res.locals.handlebars = "instructor/addCourseDescription";
        res.locals.layout = "instructor.hbs";
        if (err) console.error(err);
        else {
            // if haven't registered course yet => create new one
            if (!req.query.course) {
                res.locals.HTMLTitle = 'Create new course';

                const foundCourse = await Course.findOne({ name: req.body.course_title });
                // if user does not upload file
                if (!req.hasFile) {
                    return res.render(res.locals.handlebars, {
                        layout: res.locals.layout,
                        message: "You need to upload your image.",
                        sidebar: "my-course"
                    });
                }
                
                // if user upload invalid file
                if (!req.validFile) {
                    return res.render(res.locals.handlebars, {
                        layout: res.locals.layout,
                        message: "Your file extension is not valid.",
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
                let foundCategory = await Category.findOne({title: req.body.course_category});
                let subcategory = [];
                if (req.body.course_sub_category !== null && req.body.course_sub_category !== undefined) {
                    const foundSubcategory = foundCategory.subcategories.find((el) => el.content == req.body.course_sub_category);
                    subcategory = [foundSubcategory._id];
                }
                const newCourse = await Course.create({
                    name: req.body.course_title,
                    img: `/${req.file.path.replace('public\\', '').replaceAll('\\', '/')}`,
                    details: req.body.full_description,
                    slug: `/course/${slugify(req.body.course_title, { lower: true, locale: "vi", strict: true })}`,
                    description: req.body.short_description,
                    currency: req.body.price_currency,
                    price: req.body.price_amount,
                    sale: 0,
                    finish: 0,
                    category: foundCategory._id,
                    subcategory: subcategory,
                    author: res.locals.authUser._id,
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
                const thisInstructor = await User.findOne({ _id: res.locals.authUser._id });
                thisInstructor.myCourses.push(newCourse._id);
                await thisInstructor.save();
                res.locals.authUser.myCourses = thisInstructor.myCourses;
                return res.render('instructor/addCourseDescription', {
                    layout: res.locals.layout,
                    course_id: newCourse._id,
                    message: "successAdded",
                    sidebar: "my-course"
                });
            }
            // if registered course => edit course description
            else {
                if (req.body.requestActionInDescription == "save_course_description") { // save course description
                    // if user does not upload file
                    if (req.hasFile) {
                        // if user upload invalid file
                        if (!req.validFile) {
                            return res.render(res.locals.handlebars, {
                                layout: res.locals.layout,
                                course_id: req.query.course,
                                message: "Your file extension is not valid.",
                                sidebar: "my-course"
                            });
                        }
                    }
                    const thisCourse = await Course.findOne({ _id: req.query.course });
                    res.locals.HTMLTitle = `Edit course: ${thisCourse.name}`;
                    const thisCourseCategory = await Category.findOne({_id: thisCourse.category});
                    let foundCategory = await Category.findOne({title: req.body.course_category}).lean();
                    let subcategory = [];
                    
                    if (req.body.course_sub_category !== null && req.body.course_sub_category !== undefined) {
                        const foundSubcategory = foundCategory.subcategories.find((el) => el.content == req.body.course_sub_category);
                        if (req.body.course_category === thisCourseCategory.title && !thisCourse.subcategory.includes(foundSubcategory._id)) subcategory = [...thisCourse.subcategory, foundSubcategory._id]; // existed category and add new subcategory
                        else if (thisCourse.subcategory.includes(foundSubcategory._id)) subcategory = [...thisCourse.subcategory]; // duplicate sub category
                        else { // change new category => reset subcategory
                            subcategory = [];
                            subcategory.push(foundSubcategory._id);
                        }
                    }
                    else subcategory = [...thisCourse.subcategory];

                    await Course.findByIdAndUpdate(req.query.course, {
                        name: req.body.course_title,
                        img: (req.file && req.file.path) ? req.file.path.replace('public\\', '/').replaceAll('\\', '/') : thisCourse.img,
                        details: req.body.full_description,
                        description: req.body.short_description,
                        currency: req.body.price_currency,
                        price: req.body.price_amount,
                        category: foundCategory._id,
                        subcategory: subcategory
                    })

                    return res.render('instructor/addCourseDescription', {
                        layout: res.locals.layout,
                        course_id: req.query.course,
                        message: "successSaved",
                        sidebar: "my-course"
                    });
                }
                else if (req.body.requestActionInDescription == "delete_course_description") { // delete 
                    // delete this course
                    const thisCourse = await Course.findOne({_id: req.query.course}); // find this course
                    await Course.deleteOne({ _id: req.query.course }); // delete this course
                    // remove course folder
                    fs.rmSync(`public/courses/${thisCourse.slug.replace("/course/","")}`, { recursive: true });
                    // delete course_id in course detail
                    await CourseDetail.deleteOne({ course_id: req.query.course });
                    // delete course_id in my_course field
                    const thisInstructor = await User.findOne({ _id: res.locals.authUser._id });
                    const myCourses = thisInstructor.myCourses;
                    const newCourseList = myCourses.filter((course_id) => {
                        return course_id != req.query.course;
                    })
                    thisInstructor.myCourses = newCourseList;
                    await thisInstructor.save();
                    res.locals.authUser.myCourses = newCourseList;
                    return res.render('instructor/addCourseDescription', {
                        layout: res.locals.layout,
                        message: "successDeleted",
                        sidebar: "my-course"
                    });
                }
            }
        }
    });
});


export const getCourseContent = catchAsync(async (req, res) => {
    res.locals.handlebars = "instructor/addCourseContent";
    res.locals.layout = "instructor.hbs";
    res.locals.HTMLTitle = 'All lectures';
    // if haven't registered course yet
    if (!req.query.course) {
        return res.render('instructor/addCourseContent', {
            layout: res.locals.layout,
            message: "You need to add your course description first. Please try again!",
            sidebar: "my-course"
        });
    }

    const course = await Course.findById({ _id: req.query.course }).lean();
    const thisCourseLectures = await Course.findById({ _id: req.query.course }).select('lectures');
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


export const editCourseContent = catchAsync(async (req, res, next) => {
    res.locals.handlebars = "instructor/addCourseContent";
    res.locals.layout = "instructor.hbs";

    // config storage
    const storage = multer.diskStorage({
        destination: async function (req, file, cb) {
            req.hasFile = true;
            if (!req.query.lesson && req.query.section) { // add new lesson
                req.course = await Course.findById({ _id: req.query.course }).lean();
                const thisSection = req.course.lectures.sections.find(section => section._id.toString() === req.query.section.toString());
                const section_dir = slugify(thisSection.title, { lower: true, locale: 'vi', strict: true });
                const course_slug = req.course.slug.replace('/course/', '/courses/');
                if (!fs.existsSync(`public/${course_slug}/${section_dir}`)) {
                    fs.mkdirSync(`public${course_slug}/${section_dir}`);
                }
                cb(null, `public${course_slug}/${section_dir}`)
            }
            else if (req.query.lesson) { // edit lesson
                let foundLesson = {}; // find that lesson
                req.thisCourseLectures = await Course.findById({ _id: req.query.course }).select('lectures slug');
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
                if (file_path.indexOf('http://videostreamsv') !== -1) { 
                    const thisSection = req.thisCourseLectures.lectures.sections.find(section => section.lessons.includes(foundLesson));
                    const section_dir = slugify(thisSection.title, { lower: true, locale: 'vi', strict: true });
                    const course_slug = req.thisCourseLectures.slug.replace('/course/', '/courses/');
                    if (!fs.existsSync(`public/${course_slug}/${section_dir}`)) {
                        fs.mkdirSync(`public${course_slug}/${section_dir}`);
                    }
                    req.filepath = `public${course_slug}/${section_dir}`;
                    req.filename = `${slugify(foundLesson.title, { lower: true, locale: 'vi', strict: true })}.`;
                } 
                else {
                    req.filepath = `public${file_path}`;
                    req.filename = foundLesson.video.substring(foundLesson.video.lastIndexOf('/'), foundLesson.video.length);
                }
                cb(null, req.filepath);
            }
        },
        filename: function (req, file, cb) {
            const file_ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length).split('.')[1];
            if (!req.query.lesson && req.query.section) {
                const lesson_slug = slugify(req.body.lecture_title, { lower: true, locale: 'vi', strict: true });

                cb(null, `${lesson_slug}.${file_ext}`);
            }
            else if (req.query.lesson) {
                const only_name = req.filename.substring(0, req.filename.lastIndexOf('.'));
                cb(null, `${only_name}.${file_ext}`);
            }
        }
    })
    const upload = multer({ fileFilter: videoFilter, storage: storage });
    upload.single('videoUploadFile')(req, res, async (err) => {
        if (err) console.error(err);
        else {
            const course = req.course ? req.course : await Course.findById({ _id: req.query.course }).lean();
            const thisCourseLectures = (req.thisCourseLectures) ? req.thisCourseLectures : await Course.findById({ _id: req.query.course }).select('lectures');
            const thisCourseSlug = await Course.findById({ _id: req.query.course }).select('slug');
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
            else if (req.body.requestActionInSection == 'save_section') {
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
            else if (req.body.requestActionInSection == "delete_section") {
                const newSectionArray = thisCourseLectures.lectures.sections.filter((section) => {
                    if (section._id.toString() == req.query.section.toString()) {
                        const course_slug = thisCourseSlug.slug.replace('/course/', '');
                        const section_dir = slugify(section.title, { lower: true, locale: 'vi', strict: true });
                        const folderPath = `public/courses/${course_slug}/${section_dir}`;
                        if (fs.existsSync(folderPath)) {
                            fs.rmSync(folderPath, { recursive: true });
                        }
                        // update total number of lessons after deleting section
                       thisCourseLectures.lectures.total -= section.lessons.length
                    }
                    return section._id.toString() !== req.query.section.toString();
                })
                const nPagesCurrent = Math.ceil(newSectionArray.length / limit);
                const page = nPagesCurrent < req.query.page ? Math.max(nPagesCurrent, 1) : req.query.page;
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
                    res.locals.HTMLTitle = 'Edit lesson';
                    if (req.hasFile) { // if file already exists, if add new one => check format
                        if (!req.validVideo) {
                            return res.render('instructor/addCourseContent', {
                                layout: "instructor",
                                course_id: req.query.course,
                                page: req.query.page,
                                message: "Your video format is not valid. Try again later!",
                                sidebar: "my-course"
                            })
                        }
                    }
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
                    res.locals.HTMLTitle = 'Add new lesson';

                    if (!req.hasFile) {
                        return res.render('instructor/addCourseContent', {
                            layout: "instructor",
                            course_id: req.query.course,
                            page: req.query.page,
                            message: "You must add video of this lesson. Try again later!",
                            sidebar: "my-course"
                        })
                    }
                    if (!req.validVideo) {
                        return res.render('instructor/addCourseContent', {
                            layout: "instructor",
                            course_id: req.query.course,
                            page: req.query.page,
                            message: "Your video format is not valid. Try again later!",
                            sidebar: "my-course"
                        })
                    }
                    let thisSection = thisCourseLectures.lectures.sections.filter((section) => {
                        return section._id.toString() === req.query.section;
                    });
                    thisSection = thisSection[0]; // get section out of an array
                    const lecture_slug = slugify(req.body.lecture_title, { lower: true, locale: 'vi', strict: true });
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
                        const file_name = lesson.video.substring(lesson.video.lastIndexOf('/'), lesson.video.length).split('.')[0];
                        return lesson.title === req.body.lecture_title || file_name === slug_name;
                    });
                    if (foundLesson) {
                        return res.render('instructor/addCourseContent', {
                            layout: "instructor",
                            course_id: req.query.course,
                            page: req.query.page,
                            message: "This lesson already exists. Please choose a different lesson title.",
                            sidebar: "my-course"
                        })
                    }
                    thisSection.lessons.push(newLesson); // push new lesson
                    thisCourseLectures.lectures.total += 1;
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
            else if (req.body.requestAction === "delete_lesson") { // if user delete lesson
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
                thisCourseLectures.lectures.total -= 1;
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
