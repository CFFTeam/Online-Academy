export const homePage = (req, res) => {
    res.locals.handlebars = 'home/home';
    const categories = [
        {
            slug: "web-development",
            title: "Web Development",
            categories: [
                {
                    slug: "#javascript",
                    content: "Javascript"
                },
                {
                    slug: "#html",
                    content: "HTML"
                },
                {
                    slug: "#css",
                    content: "CSS"
                },
                {
                    slug: "#reactjs",
                    content: "ReactJS"
                },
                {
                    slug: "#nodejs",
                    content: "NodeJS"
                }
            ]
        },
        {
            slug: "mobile-development",
            title: "Mobile Development",
            categories : [
                {
                    slug: "#javakotlin",
                    content: "Java Kotlin - Android"
                },
                {
                    slug: "#swift",
                    content: "Swift - IOS"
                },
                {
                    slug: "#flutter",
                    content: "Flutter"
                },
                {
                    slug: "#reactnative",
                    content: "React Native"
                },
                {
                    slug: "#xamarin",
                    content: "Xamarin"
                }
            ]
        },
        {
            slug: "game-development",
            title: "Game Development",
            categories: [
                {
                    slug: "#unity",
                    content: "Unity"
                },
                {
                    slug: "#unreal-engine",
                    content: "Unreal Engine"
                },
                {
                    slug: "#c#",
                    content: "C#"
                },
                {
                    slug: "#C++",
                    content: "C++"
                },
                {
                    slug: "#blender",
                    content: "Blender"
                }
            ]
        }
    ];

    const hotCourse = [
        {
            active: true,
            course_name: "Node.js, Express, MongoDB & More: The Complete Bootcamp 2023",
            course_rate: "4.7",
            course_vote: "15.379",
            course_viewer: "94.227",
            course_author: "Jonas Schmedtmann",
            course_price: "105.67",
            course_sale: "16.03",
            course_category: "Website development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1672410_9ff1_5.jpg",
            course_description: "Master Node by building a real-world RESTful API and web app (with authentication, Node.js security, payments & more)",
            course_duration: "42h 12m total duration",
            course_lessons: "229 lessons"
        },
        {
            course_name: "The Complete 2023 Web Development Bootcamp",
            course_rate: "4.7",
            course_vote: "246.888",
            course_viewer: "843.615",
            course_author: "Dr.Angela Yu",
            course_price: "92.98",
            course_sale: "12.64",
            course_category: "Website development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/480x270/1565838_e54e_16.jpg",
            course_description: "Become a Full-Stack Web Developer with just ONE course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps",
            course_duration: "65h 33m total duration",
            course_lessons: "490 lessons"
        },
        {
            course_name: "The Complete JavaScript Course 2023: From Zero to Expert!",
            course_rate: "4.7",
            course_vote: "160.970",
            course_viewer: "725.001",
            course_author: "Jonas Schmedtmann",
            course_price: "105.67",
            course_sale: "14.76",
            course_date: "11/2022",
            course_category: "Website development",
            course_img: "https://img-c.udemycdn.com/course/240x135/851712_fc61_6.jpg",
            course_description: "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory. Many courses in one!",
            course_duration: "69h 0m total duration",
            course_lessons: "320 lesssions"
        },
        {
            course_name: "Flutter & Dart - The Complete Guide [2023 Edition]",
            course_rate: "4.6",
            course_vote: "55.981",
            course_viewer: "225.400",
            course_author: "Maximilian Schwarzmüller",
            course_price: "80.30",
            course_sale: "11.80",
            course_category: "Mobile development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1708340_7108_5.jpg",
            course_description: "A Complete Guide to the Flutter SDK & Flutter Framework for building native iOS and Android apps",
            course_duration: "42h 34m total duration",
            course_lessons: "379 lessons"
        }
    ];

    const mostviewCourse = [
        {
            course_name: "The Complete 2023 Web Development Bootcamp",
            course_rate: "4.7",
            course_vote: "246.888",
            course_viewer: "843.615",
            course_author: "Dr.Angela Yu",
            course_price: "92.98",
            course_sale: "12.64",
            course_category: "Website development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/480x270/1565838_e54e_16.jpg"
        },
        {
            course_name: "Build Responsive Real-World Websites with HTML and CSS",
            course_rate: "4.8",
            course_vote: "87.572",
            course_viewer: "352.190",
            course_author: "Jonas Schmedtmann",
            course_price: "84.52",
            course_sale: "12.64",
            course_date: "11/2022",
            course_category: "Website development",
            course_img: "https://img-c.udemycdn.com/course/240x135/437398_46c3_10.jpg"
        },
        {
            course_name: "React - The Complete Guide (incl Hooks, React Router, Redux)",
            course_rate: "4.6",
            course_vote: "170.867",
            course_viewer: "674.188",
            course_author: "Maximilian Schwarzmüller",
            course_price: "101.44",
            course_sale: "14.76",
            course_category: "Website development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1362070_b9a1_2.jpg"
        },
        {
            course_name: "The Complete JavaScript Course 2023: From Zero to Expert!",
            course_rate: "4.7",
            course_vote: "160.970",
            course_viewer: "725.001",
            course_author: "Jonas Schmedtmann",
            course_price: "105.67",
            course_sale: "14.76",
            course_date: "11/2022",
            course_category: "Website development",
            course_img: "https://img-c.udemycdn.com/course/240x135/851712_fc61_6.jpg"
        },
        {
            course_name: "Node.js, Express, MongoDB & More: The Complete Bootcamp 2023",
            course_rate: "4.7",
            course_vote: "15.379",
            course_viewer: "94.227",
            course_author: "Jonas Schmedtmann",
            course_price: "105.67",
            course_sale: "16.03",
            course_category: "Website development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1672410_9ff1_5.jpg"
        },
        {
            course_name: "React Native - The Practical Guide [2023]",
            course_rate: "4.7",
            course_vote: "30.310",
            course_viewer: "172.015",
            course_author: "Maximilian Schwarzmüller",
            course_price: "84.52",
            course_sale: "12.64",
            course_category: "Mobile development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1436092_2024_4.jpg"
        },
        {
            course_name: "Flutter & Dart - The Complete Guide [2023 Edition]",
            course_rate: "4.6",
            course_vote: "55.981",
            course_viewer: "225.400",
            course_author: "Maximilian Schwarzmüller",
            course_price: "80.30",
            course_sale: "11.80",
            course_category: "Mobile development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1708340_7108_5.jpg"
        },
        {
            course_name: "Artificial Intelligence A-Z™: Learn How To Build An AI",
            course_rate: "4.4",
            course_vote: "22.001",
            course_viewer: "190.935",
            course_author: "Hadelin de Ponteves",
            course_price: "92.98",
            course_sale: "12.64",
            course_category: "Artificial Intelligence",
            course_date: "12/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1219332_bdd7.jpg"
        },
        {
            course_name: "TensorFlow Developer Certificate in 2023: Zero to Mastery",
            course_rate: "4.7",
            course_vote: "5.666",
            course_viewer: "42.232",
            course_author: "Andrei Neagoie",
            course_price: "80.30",
            course_sale: "11.80",
            course_category: "Artificial Intelligence",
            course_date: "12/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/3693164_f87d_3.jpg"
        },
        {
            course_name: "Deep Learning A-Z™: Hands-On Artificial Neural Networks",
            course_rate: "4.5",
            course_vote: "41.664",
            course_viewer: "345.609",
            course_author: "Kirill Eremenko",
            course_price: "84.52",
            course_sale: "12.64",
            course_category: "Artificial Intelligence",
            course_date: "12/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/1151632_de9b.jpg"
        }
    ];

    const newestCourse = [
        {
            course_name: "Math for Data Science Masterclass",
            course_rate: "4.7",
            course_vote: "252",
            course_viewer: "5.442",
            course_author: "Jose Portilla",
            course_price: "71.84",
            course_sale: "10.53",
            course_date: "12/2022",
            course_category: "Artificial Intelligence",
            course_img: "https://img-c.udemycdn.com/course/240x135/4849126_3676_2.jpg"
        },
        {
            course_name: "Nodejs API Complete Guide Build a Blog Project API 2023",
            course_rate: "4.9",
            course_vote: "12",
            course_viewer: "1.159",
            course_author: "i novotek Academy",
            course_price: "18.14",
            // course_sale: "10.53",
            course_date: "11/2022",
            course_category: "Website development",
            course_img: "https://img-c.udemycdn.com/course/240x135/4980426_ee5d_3.jpg"
        },
        {
            course_name: "MERN Stack Real Time Chat App - React , Node , Socket IO",
            course_rate: "5.0",
            course_vote: "3",
            course_viewer: "60",
            course_author: "K.Sathyaprakash Reddy",
            course_price: "18.14",
            // course_sale: "10.53",
            course_category: "Website development",
            course_date: "12/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/5015910_2a41_2.jpg"
        },
        {
            course_name: "Data Science & Machine Learning: Naive Bayes in Python",
            course_rate: "4.8",
            course_vote: "43",
            course_viewer: "567",
            course_author: "Lazy Programmer Inc.",
            course_price: "71.84",
            course_sale: "10.53",
            course_category: "Artificial Intelligence",
            course_date: "12/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/4929064_b97d.jpg"
        },
        {
            course_name: "End-to-end data science and machine learning project",
            course_rate: "5.0",
            course_vote: "1",
            course_viewer: "9",
            course_author: "Sara Malvar",
            course_price: "20.25",
            course_sale: "10.53",
            course_category: "Artificial Intelligence",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/3681724_0b88_2.jpg"
        },
        {
            course_name: "Python All In-One 2023 ™️ -Everything You'll Ever Need",
            course_rate: "4.8",
            course_vote: "33",
            course_viewer: "454",
            course_author: "Mouhammad Hamsho",
            course_price: "63.38",
            course_sale: "10.53",
            course_category: "Web development",
            course_date: "12/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/4929652_63c4_8.jpg"
        },
        {
            course_name: "Create E-commerce Web Application Using Node JS",
            course_rate: "0.0",
            course_vote: "0",
            course_viewer: "1",
            course_author: "Mustafa Alawi",
            course_price: "71.84",
            course_sale: "10.53",
            course_category: "Website development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/4977502_ac7a.jpg"
        },
        {
            course_name: "Modern MERN Stack | React Node Express MongoDB",
            course_rate: "5.0",
            course_vote: "2",
            course_viewer: "16",
            course_author: "Riaz Qureshi",
            course_price: "18.14",
            // course_sale: "10.53",
            course_category: "Website development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/4835930_d67c_4.jpg"
        },
        {
            course_name: "React JS from Zero to Hero",
            course_rate: "4.0",
            course_vote: "1",
            course_viewer: "2",
            course_author: "Elias Rodrigo Rosa",
            course_price: "18.14",
            // course_sale: "10.53",
            course_category: "Website development",
            course_date: "12/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/4956178_557e_2.jpg"
        },
        {
            course_name: "Learn JavaScript By Creating A Simple Number Game",
            course_rate: "0.0",
            course_vote: "0",
            course_viewer: "1",
            course_author: "Godson Thomas",
            course_price: "23.21",
            // course_sale: "10.53",
            course_category: "Game development",
            course_date: "11/2022",
            course_img: "https://img-c.udemycdn.com/course/240x135/4958404_f6f9_2.jpg"
        }
    ]

    res.render('home/home', { categories: JSON.stringify(categories), hotCourse, mostviewCourse, newestCourse }); 
};