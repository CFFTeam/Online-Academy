import { load } from 'cheerio';
import request from 'request-promise';
import fs from 'fs';

import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.argv[2];
const mode = process.argv[3];

if (mode === "--courses") {
    request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = load(html);
            
            const course_id = $('body#udemy').attr('data-clp-course-id');
            if (course_id) {
                const options = {
                    uri: `https://www.udemy.com/api-2.0/courses/${course_id.trim()}?fields[course]=@default,headline,avg_rating,created,primary_category,primary_subcategory,description,owner,num_subscribers,-price_detail,-price_serve_tracking_id,-tracking_id,-is_practice_test_course,-is_paid&fields[course_category]=title,-id&fields[course_subcategory]=title,-created,-id&fields[user]=display_name,-title,-name,-initials`,
                    headers: {
                        'Authorization': `Basic UlBvV01wa2NMMElIekdCQk5ZaFp2SW9pdktNRDluQVhPZ1oyajF6bjpld0JMU0cwTXBuaVdLTW1QN2xteUNoWjd6bWN2d05SenlJTnlvZ2NuOEx0NnZzaURZcTNudkM0UjZ5TXp6Y2ljQXZsSVJYdVRzR3ZtOG01eUxKQkc1OWJES0hiQVNqRUFEeUsybVlxTExoczRGQnNJTTlGNEZnMDNJdEc4eExwVQ==`,
                        "Accept": "application/json, text/plain, */*",
                        "Content-Type": "application/json;charset=utf-8"
                    }
                }
    
                request(options, (error, response, data) => {
                    const course = data.replaceAll(',"', ',\n"');
                    const courseObj = JSON.parse(course);
    
                    const newCourse ={};
    
                    newCourse.name = courseObj.title;
                    newCourse.img = courseObj.image_480x270;
                    newCourse.details = courseObj.description;
                    newCourse.slug = courseObj.url;
                    newCourse.author = courseObj.visible_instructors[0].display_name;
                    newCourse.price = courseObj.price;
                    newCourse.description = courseObj.headline;
                    newCourse.currency = 'USD';
                    newCourse.sale = 0;
                    newCourse.category = courseObj.primary_category.title;
                    newCourse.subcategory = courseObj.primary_subcategory.title;
                    newCourse.date = courseObj.created;
                    newCourse.lectures = {
                        total: 0,
                        duration: "",
                        sections: [{
                            title: "",
                            total: 0,
                            duration: "",
                            lessons: [{ 
                                title: "",
                                resourses: "",
                                video: ""
                            }]
                        }]
                    }
    
                    fs.writeFileSync(`${__dirname}/courses/${courseObj.published_title}.json`, JSON.stringify(newCourse), err => {
                        if (err)
                            console.error(err);
                    });
                });
                console.log('File saved successfully');
            }
            else 
                console.log('No course id found');
        }
    });
}
else if (mode === "--course-details") {
    request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = load(html);
            
            const course_id = $('body#udemy').attr('data-clp-course-id');
            if (course_id) {
                const options = {
                    uri: `https://www.udemy.com/api-2.0/courses/${course_id.trim()}?fields[course]=@default,headline,avg_rating,created,primary_category,primary_subcategory,description,owner,num_subscribers,-price_detail,-price_serve_tracking_id,-tracking_id,-is_practice_test_course,-is_paid&fields[course_category]=title,-id&fields[course_subcategory]=title,-created,-id&fields[user]=display_name,-title,-name,-initials`,
                    headers: {
                        'Authorization': `Basic UlBvV01wa2NMMElIekdCQk5ZaFp2SW9pdktNRDluQVhPZ1oyajF6bjpld0JMU0cwTXBuaVdLTW1QN2xteUNoWjd6bWN2d05SenlJTnlvZ2NuOEx0NnZzaURZcTNudkM0UjZ5TXp6Y2ljQXZsSVJYdVRzR3ZtOG01eUxKQkc1OWJES0hiQVNqRUFEeUsybVlxTExoczRGQnNJTTlGNEZnMDNJdEc4eExwVQ==`,
                        "Accept": "application/json, text/plain, */*",
                        "Content-Type": "application/json;charset=utf-8"
                    }
                }
    
                request(options, (error, response, data) => {
                    const course = data.replaceAll(',"', ',\n"');
                    const courseObj = JSON.parse(course);
    
                    const newCourse ={};
    
                    newCourse.name = courseObj.title;
                    newCourse.img = courseObj.image_480x270;
                    newCourse.details = courseObj.description;
                    newCourse.slug = courseObj.url;
                    newCourse.author = courseObj.visible_instructors[0].display_name;
                    newCourse.price = courseObj.price;
                    newCourse.description = courseObj.headline;
                    newCourse.currency = 'USD';
                    newCourse.sale = 0;
                    newCourse.category = courseObj.primary_category.title;
                    newCourse.subcategory = courseObj.primary_subcategory.title;
                    newCourse.date = courseObj.created;
                    newCourse.lectures = {
                        total: 0,
                        duration: "",
                        sections: [{
                            title: "",
                            total: 0,
                            duration: "",
                            lessons: [{ 
                                title: "",
                                resourses: "",
                                video: ""
                            }]
                        }]
                    }
    
                    fs.writeFileSync(`${__dirname}/courses/${courseObj.published_title}.json`, JSON.stringify(newCourse), err => {
                        if (err)
                            console.error(err);
                    });
                });
                console.log('File saved successfully');
            }
            else 
                console.log('No course id found');
        }
    });
}