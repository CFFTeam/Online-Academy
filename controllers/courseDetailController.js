import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import courseDetail from "../models/courseDetailsModel.js";
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

    if(course !==null && newcourse.length<5){
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
          course_lessons: course.lectures.total,
        };
        newcourse.push(new_hot_course);
    }
  }
  return newcourse;
};

export const renderCourseDetail = catchAsync(async (req, res) => {
  res.locals.handlebars = "courseDetail/courseDetail";

  const getCourse = await Course.findOne({
    slug: `/course${url.parse(req.url, true).pathname}`,
  }).lean();

  const getCourseRating = await courseDetail
    .findOne({
      course_id: getCourse._id,
    })
    .lean();

  for (let i = 0; i < getCourseRating.reviews.length; i++){
    getCourseRating.reviews[i]["update"] = getCourseRating.reviews[i].created.slice(
      0,
      10
    );
    getCourseRating.reviews[i]["integerPart"] = Array(Math.floor(getCourseRating.reviews[i].rating)).fill('0');
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
  });
});
