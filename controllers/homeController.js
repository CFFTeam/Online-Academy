export const homePage = (req, res) => {
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
    ]

    res.render('home/home', { categories: JSON.stringify(categories) }); 
};