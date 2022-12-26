import categoryModel from "../models/categoryModel.js";
import courseModel from "../models/courseModel.js";
import courseDetailsModel from "../models/courseDetailsModel.js";

export const homePage = async (req, res) => {
    res.locals.handlebars = 'home/home';
    const categories = await categoryModel.find();
    
    const loadhotCourse = async () => {
        const hotCourses = await courseDetailsModel.find().select('-reviews').sort('-viewer').limit(10).lean();
        const newcourse = [];
        for (let index = 0; index < hotCourses.length; index++) {
            const hotCoursesDetails = hotCourses[index];
            const course = await courseModel.findOne({_id: hotCoursesDetails.course_id}).select('-lectures.sections').lean();
            
            const new_hot_course = {
                active: index === 0 ? true : false,
                course_name: course.name,
                course_rate: hotCoursesDetails.avg_rating,
                course_vote: hotCoursesDetails.num_reviews,
                course_viewer: hotCoursesDetails.viewer,
                course_author: course.author,
                course_price: course.price,
                course_status: "best seller",
                course_category: course.category,
                course_date: new Date(course.date).toLocaleString('en-US', { month: 'numeric', year: 'numeric' }),
                course_img: course.img,
                course_description: course.description,
                course_duration: course.lectures.duration,
                course_lessons: course.lectures.total
            }
            newcourse.push(new_hot_course);
        }
        return newcourse;
    }

    const loadMostViewCourse = async () => {
        const mostViewCourse = await courseModel.find().select('-lectures.sections').sort('-date').limit(10).lean();
        const newcourse = [];
        
        for (let index = 0; index < mostViewCourse.length; index++) {
            const course = mostViewCourse[index];
            const mostViewCourseDetails = await courseDetailsModel.findOne({course_id: course._id}).select('-reviews').lean();

            const new_hot_course = {
                active: index === 0 ? true : false,
                course_name: course.name,
                course_rate: mostViewCourseDetails.avg_rating,
                course_vote: mostViewCourseDetails.num_reviews,
                course_viewer: mostViewCourseDetails.viewer,
                course_author: course.author,
                course_price: course.price,
                course_status: "new",
                course_category: course.category,
                course_date: new Date(course.date).toLocaleString('en-US', { month: 'numeric', year: 'numeric' }),
                course_img: course.img,
                course_description: course.description,
                course_duration: course.lectures.duration,
                course_lessons: course.lectures.total
            }
            newcourse.push(new_hot_course);
        }
        return newcourse;
    }
    
    const mostviewCourse = await loadhotCourse();
    const hotCourse = mostviewCourse.slice(0, 4);
    
    const newestCourse = await loadMostViewCourse();

    res.render('home/home', { categories: JSON.stringify(categories), hotCourse, mostviewCourse, newestCourse });
};