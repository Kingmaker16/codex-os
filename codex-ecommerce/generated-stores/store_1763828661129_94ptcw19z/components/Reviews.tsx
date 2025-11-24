interface ReviewsProps {
  productId: string;
}

export default function Reviews({ productId }: ReviewsProps) {
  const mockReviews = [
    { id: 1, author: 'Sarah M.', rating: 5, text: 'Amazing quality! Highly recommend.' },
    { id: 2, author: 'John D.', rating: 4, text: 'Great product, fast shipping.' },
    { id: 3, author: 'Emily R.', rating: 5, text: 'Exceeded my expectations!' }
  ];

  return (
    <section className="reviews">
      <h2>Customer Reviews</h2>
      <div className="reviews-list">
        {mockReviews.map(review => (
          <div key={review.id} className="review">
            <div className="review-header">
              <span className="author">{review.author}</span>
              <span className="rating">{'⭐'.repeat(review.rating)}</span>
            </div>
            <p>{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
