import { useParams } from "react-router-dom";
import blogs from "../data/blogs";

function BlogDetails() {
  const { id } = useParams();

  const blog = blogs.find((b) => b.id === Number(id));

  if (!blog) {
    return <h2>Blog not found</h2>;
  }

  return (
    <div style={{ padding: "50px" }}>
      <h1>{blog.title}</h1>

      <p>
        <strong>Author:</strong> {blog.author}
      </p>

      <p>
        <strong>Category:</strong> {blog.category}
      </p>

      <p>
        <strong>Date:</strong> {blog.date}
      </p>

      <hr />

      <p>{blog.description}</p>

      <br />

      <p>
        This is where the complete blog content will be displayed.
      </p>
    </div>
  );
}

export default BlogDetails;