import courseModel from "../models/courseModel.js";
import courseDetailsModel from "../models/courseDetailsModel.js";
import { fixDateFormat, fixNumberFormat } from "../utilities/fixFormat.js";
import catchAsync from "../utilities/catchAsync.js";

const loadAllCourses = async (sort_by, offset = 1, limit = 10) => {

    const skip = (offset - 1) * limit;

    if (sort_by === 'default') sort_by = '-viewer';
    if (sort_by === 'rating') sort_by = '-avg_rating';

    const courses = (sort_by === 'price') 
    ? await courseModel.find().select('-lectures.sections')
    .sort(sort_by).collation({ locale: 'en', numericOrdering: true })
    .skip(skip).limit(limit).lean()
    : await courseDetailsModel.find().select('-reviews')
    .sort(sort_by).collation({ locale: 'en', numericOrdering: true })
    .skip(skip).limit(limit).lean()

    const newcourse = [];
    
    for (let index = 0; index < courses.length; index++) {
        const course = (sort_by === 'price') ? courses[index] : await courseModel.findOne({ _id: courses[index].course_id }).select('-lectures.sections').lean();
        const coursesDetails = (sort_by === 'price') ? await courseDetailsModel.findOne({ course_id: courses[index]._id }).select('-reviews').lean() : courses[index];

        const newest_course = {
            active: index === 0 ? true : false,
            course_name: course.name,
            course_rate: coursesDetails.avg_rating,
            course_vote: fixNumberFormat(coursesDetails.num_reviews),
            course_viewer: fixNumberFormat(coursesDetails.viewer),
            course_author: course.author,
            course_price: course.price,
            course_category: course.category,
            course_date: fixDateFormat(course.date),
            course_img: course.img,
            course_description: course.description,
            course_duration: course.lectures.duration,
            course_lessons: course.lectures.total
        }
        newcourse.push(newest_course);
    }
    return newcourse;
};

export const coursesPage = catchAsync(async (req, res) => {
    res.locals.handlebars = 'home/courses';
    res.locals.sort_by = req.query.sort_by || 'default';
    res.locals.page = req.query.page || 1;

    const limit = 10;
    const offset = res.locals.page;

    const courses = await loadAllCourses(res.locals.sort_by, offset, limit);
    const totalPage = Math.floor((await courseModel.find().count()) / limit);

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

    
    res.render(res.locals.handlebars, { courses, pageList: pageList });
});

export const categoryCoursePage = catchAsync(async (req, res) => { 
    res.locals.handlebars = 'home/courses';

    const { category, subcategory } = req.params;
    
    console.log(category, subcategory);
    res.render(res.locals.handlebars);
});