import catchAsync from "../utilities/catchAsync.js";
import Course from "../models/courseModel.js";
import courseDetail from "../models/courseDetailsModel.js";
import url from "url";

export const renderCourseDetail = catchAsync(async (req, res) => {
    res.locals.handlebars = "courseDetail/courseDetail";

    const getCourse = await Course.findOne({
        slug: `/course${url.parse(req.url, true).pathname}/`
    }).lean();

    const getCourseRating = await courseDetail.findOne({
        course_id: getCourse._id
    }).lean();  

    const getThreeLastComment = getCourseRating.reviews.slice(getCourseRating.reviews.length-3, getCourseRating.reviews.length);
    for(let i = 0; i < getThreeLastComment.length; i++) {
        getThreeLastComment[i]["integerPart"] = Math.floor(getThreeLastComment[i].rating);
        getThreeLastComment[i]["isRemainder"] = getThreeLastComment[i].rating - Math.floor(getThreeLastComment[i].rating) !==0 ;
    }
    res.render("courseDetail/courseDetail.hbs", {
        courseDetail: getCourse,
        courseRating: getCourseRating,
        integerPart: Math.floor(getCourseRating.avg_rating),
        isRemainder: getCourseRating.avg_rating - Math.floor(getCourseRating.avg_rating) !==0,
        dateUpdate: getCourse.date.slice(0,10),
        numberSection: getCourse.lectures.sections.length,
        getThreeLastComment: getThreeLastComment,
        layout: "courseDetail.hbs"
    });

  });