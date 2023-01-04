import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import courseDetail from "../models/courseDetailsModel.js";
import User from "../models/userModel.js";
import url from "url";

const loadhotCourse = async (sameCategory) => {
  const hotCourses = await courseDetail
    .find()
    .select("-reviews")
    .sort("-viewer")
    .lean();
  const newcourse = [];

  for (let index = 0; index < hotCourses.length; index++) {
    const hotCoursesDetails = hotCourses[index];
    const course = await Course.findOne({
      _id: hotCoursesDetails.course_id,
      category: sameCategory
    })
      .select("-lectures.sections")
      .lean();

    if (course !== null && newcourse.length < 5) {
      const new_hot_course = {
        active: index === 0 ? true : false,
        course_name: course.name,
        course_slug: course.slug,
        course_rate: hotCoursesDetails.avg_rating,
        course_vote: fixNumberFormat(hotCoursesDetails.num_reviews),
        course_viewer: fixNumberFormat(hotCoursesDetails.viewer),
        course_author: course.author,
        course_price: course.price,
        course_status: "best seller",
        course_category: course.category,
        course_date: fixDateFormat(course.date),
        course_img: course.img,
        course_description: course.description,
        course_duration: course.lectures.duration,
        course_lessons: course.lectures.total
      };
      newcourse.push(new_hot_course);
    }
  }
  return newcourse;
};

export const renderCourseDetail = catchAsync(async (req, res) => {
  res.locals.handlebars = "courseDetail/courseDetail";

  const getCourse = await Course.findOne({
    slug: `/course${url.parse(req.url, true).pathname}`
  }).lean();

  const getCourseRating = await courseDetail
    .findOne({
      course_id: getCourse._id
    })
    .lean();

  for (let i = 0; i < getCourseRating.reviews.length; i++) {
    getCourseRating.reviews[i]["update"] = getCourseRating.reviews[
      i
    ].created.slice(0, 10);
    getCourseRating.reviews[i]["integerPart"] = Array(
      Math.floor(getCourseRating.reviews[i].rating)
    ).fill("0");
    getCourseRating.reviews[i]["isRemainder"] =
      getCourseRating.reviews[i].rating -
        Math.floor(getCourseRating.reviews[i].rating) !==
      0;
  }

  const getThreeLastComment = getCourseRating.reviews.slice(
    getCourseRating.reviews.length - 3,
    getCourseRating.reviews.length
  );

  const mostviewCourse = await loadhotCourse(getCourse.category);
  let user=null;
  let isExist = false;

  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id }).lean();
    let myCourses = user.myCourses;
    if (myCourses.includes(getCourse._id.toString())){
      isExist=true;
    }
  }
  res.render("courseDetail/courseDetail.hbs", {
    courseDetail: getCourse,
    courseRating: getCourseRating,
    integerPart: Math.floor(getCourseRating.avg_rating),
    isRemainder:
      getCourseRating.avg_rating - Math.floor(getCourseRating.avg_rating) !== 0,
    dateUpdate: getCourse.date.slice(0, 10),
    numberSection: getCourse.lectures.sections.length,
    getThreeLastComment: getThreeLastComment,
    layout: "courseDetail.hbs",
    mostviewCourse: mostviewCourse,
    isExist: isExist
  });
});

export const handleBuyNow = catchAsync(async (req, res) => {
  res.locals.handlebars = "courseDetail/courseDetail";
  let user=null;

  if (res.locals && res.locals.authUser) {
    const courses = await Course.findOne({ _id: req.body.course_id }).lean();

    user = await User.findOne({ _id: res.locals.authUser._id }).lean();
    let getMyCourses = user.myCourses;
    
    if(getMyCourses.includes(req.body.course_id)===false){
      getMyCourses.push(req.body.course_id);
    }

    const current_course = {
      course_id: req.body.course_id,
      total: courses.lectures.total,
      progress: []
    };

    courses.lectures.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        current_course.progress.push({
          lesson_id: lesson._id,
          status: false
        });
      });
    });

    await User.updateOne(
      { _id: res.locals.authUser._id },
      { myCourses: [...getMyCourses], my_progress: [...user.my_progress, current_course] }
    )
    const url = req.headers.referer;
    res.redirect(url);
  }
  else{
    res.redirect("/account/login");
  }
});

export const handleCmt = catchAsync(async (req, res) => {
  res.locals.handlebars = "courseDetail/courseDetail";
  let user=null;

  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id }).lean();
    let getCourseDetail = await courseDetail.findOne({ course_id: req.body.course_id }).lean();
    let getTotalReviews = getCourseDetail.num_reviews;
    getTotalReviews = getTotalReviews + 1;
    let getReviews = getCourseDetail.reviews;
    const getCmt = {
      content: req.body.textcmt,
      rating: parseInt(req.body.ratingcmt),
      created: new Date(),
      like: 0,
      dislike: 0,
      user:{
        name: user.name,
        avata: ""
      }
    }
    getReviews.push(getCmt);
    await courseDetail.updateOne(
      { course_id: req.body.course_id },
      { reviews: [...getReviews], num_reviews: getTotalReviews}
    )
    const url = req.headers.referer;
    console.log(url);
    res.redirect(url);
  }
  else{
    res.redirect("/account/login");
  }
});