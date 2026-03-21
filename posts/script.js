const listaPosts = [
"exemplo.md"
]

const container = document.getElementById("posts")

listaPosts.forEach(post => {

const link = document.createElement("a")

link.href = "post.html?post=" + post

link.innerText = post

container.appendChild(link)

container.appendChild(document.createElement("br"))

})