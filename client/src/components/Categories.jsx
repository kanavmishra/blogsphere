import "../styles/categories.css";

function Categories() {
  const categories = [
    "Technology",
    "Programming",
    "Cybersecurity",
    "AI",
    "Web Development",
    "Lifestyle",
  ];

  return (
    <section className="categories">
      <h2>Browse by Category</h2>

      <div className="category-list">
        {categories.map((category) => (
          <button key={category} className="category-btn">
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}

export default Categories;