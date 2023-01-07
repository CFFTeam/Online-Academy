import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import Category from "../models/categoryModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import courseDetail from "../models/courseDetailsModel.js";
import User from "../models/userModel.js";
import url from "url";

export const load_my_courses = catchAsync(async (req, res, next) => {
  if (req.session.auth || req.session.passport) {
      const my_courses = await User.findOne({ _id: res.locals.authUser._id }).select('myCourses').lean();
      req.myCourses = my_courses.myCourses;
  }
  next();
});

export const loadMyWishCourse = catchAsync(async (req, res, next) => {
  if (res.locals && res.locals.authUser) {
      const myWishCourses = await User.findOne({ _id: res.locals.authUser._id }).select("wishlist").lean();
      req.myWishCourses = myWishCourses.wishlist;
  }
  next();
})


const loadhotCourse = async (myCourses, myWishCourses, categories, authors) => { 
  const hotCourses = await courseDetail.find({ viewer: { $gt: 40000 } }).select('-reviews').sort('-viewer').limit(10).lean();
  const newcourse = [];

  for (let index = 0; index < hotCourses.length; index++) {
      const hotCoursesDetails = hotCourses[index];
      const course = await Course.findOne({ _id: hotCoursesDetails.course_id, finish: 1, active: true }).select('-lectures.sections').lean();

      const new_hot_course = {
          active: index === 0 ? true : false,
          course_name: course.name,
          course_slug: course.slug,
          course_rate: hotCoursesDetails.avg_rating,
          course_vote: fixNumberFormat(hotCoursesDetails.num_reviews),
          course_viewer: fixNumberFormat(hotCoursesDetails.viewer),
          course_author: authors.find(el => el._id.toString() === course.author).name || '',
          course_price: course.price,
          course_status: "best seller",
          course_category: categories.find(el => el._id.toString() === course.category).title || '',
          course_date: fixDateFormat(course.date),
          course_img: course.img,
          course_description: course.description,
          course_duration: course.lectures.duration,
          course_lessons: course.lectures.total,
          course_id: course._id,
          my_courses: (myCourses && myCourses.includes(course._id.toString())) ? true : false,
          myWishCourses: (myWishCourses && myWishCourses.includes(course._id.toString())) ? "chosen" : ""
      }
      newcourse.push(new_hot_course);
  }
  return newcourse;
}

export const renderCourseDetail = catchAsync(async (req, res) => {
  res.locals.handlebars = "courseDetail/courseDetail";

  const allCourses = await Course.findOne({
    slug: `/course${url.parse(req.url, true).pathname}`
  }).lean();
  
  const allCategories = await Category.find().lean();
  const instructors = await User.findOne({_id:allCourses.author}).lean();

  allCourses['nameAuthor']=instructors.name;

  allCourses['nameSubCategory'] = [];
  for(let i=0; i<allCategories.length; i++){
    if(allCourses.category===allCategories[i]._id.toString()){
      allCourses['nameCategory']=allCategories[i].title;
    }
    for(let j=0; j<allCategories[i].subcategories.length; j++){
      for(let z=0; z<allCourses.subcategory.length; z++){
        if(allCourses.subcategory[z]===allCategories[i].subcategories[j]._id.toString()){
          allCourses['nameSubCategory'].push(allCategories[i].subcategories[j].content);
        }
      }
    }
  }

  const getCourseByAuthor = await Course.find({author: allCourses.author}).lean();
  const getCourseByAuthorArray = [...getCourseByAuthor];
  let getCourseDetailByAuthor = [];
  let sumRating = 0;
  let sumViewer = 0;
  let sumReview = 0;
  for(let i=0; i<getCourseByAuthorArray.length; i++){
    const getCourseDetailTemp = await courseDetail.findOne({course_id: getCourseByAuthorArray[i]._id})
    getCourseDetailByAuthor.push(getCourseDetailTemp);
  }
  for(let i=0; i<getCourseDetailByAuthor.length; i++){
    sumRating += getCourseDetailByAuthor[i].avg_rating;
    sumViewer += getCourseDetailByAuthor[i].viewer;
    sumReview +=  getCourseDetailByAuthor[i].num_reviews;
  }
  const numCourse = getCourseByAuthorArray.length;
  const avgRating = sumRating / numCourse;


  const getCourseRating = await courseDetail
    .findOne({
      course_id: allCourses._id
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

  const categories = JSON.parse(res.locals.categories);
  const authors = await User.find().select('name').lean();

  const mostviewCourse = await loadhotCourse(req.myCourses, req.myWishCourses, categories, authors);
  let user=null;
  let isExist = false;

  if (res.locals && res.locals.authUser) {
    user = await User.findOne({ _id: res.locals.authUser._id }).lean();
    let myCourses = user.myCourses;
    if (myCourses.includes(allCourses._id.toString())){
      isExist=true;
    }
  }
  res.render("courseDetail/courseDetail.hbs", {
    courseDetail: allCourses,
    courseRating: getCourseRating,
    authorDetail: instructors,
    avgRating: avgRating,
    sumViewer: sumViewer,
    sumReview: sumReview,
    numCourse: numCourse,
    integerPart: Math.floor(getCourseRating.avg_rating),
    isRemainder:
      getCourseRating.avg_rating - Math.floor(getCourseRating.avg_rating) !== 0,
    dateUpdate: allCourses.date.slice(0, 10),
    numberSection: allCourses.lectures.sections.length,
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

    const getCourseDetail = await courseDetail.findOne({ course_id: req.body.course_id }).lean();
    let view = getCourseDetail.viewer + 1;
    await courseDetail.updateOne(
      {course_id: req.body.course_id},
      {viewer: view}
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