import React, { useEffect, useState } from 'react';
import styles from './Reviews.module.css';
import { Star } from 'lucide-react';
import axios from 'axios';

const Reviews = ({ doctorId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => {
    fetchReviews();
    checkAppointment();
  }, [doctorId, user]);

  //  Fetch all reviews for this doctor
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/${doctorId}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  //  Check if user can review (completed appointment & not already reviewed)
  const checkAppointment = async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/check-appointment/${doctorId}/${user.id}`
      );
      setAppointmentId(res.data.appointment_id || null);
      setCanReview(Boolean(res.data.canReview));
    } catch (err) {
      console.error('Error checking appointment:', err);
    }
  };

  //  Handle Review Submit
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText || rating === 0) {
      return alert('Please add a rating and review.');
    }

    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        appointment_id: appointmentId,
        doctor_id: doctorId,
        patient_id: user.id,
        review: reviewText,
        rating: rating,
      });

      setCanReview(false);
      setReviewText('');
      setRating(0);
      fetchReviews();

      
     
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.reviewssection}>
      <h2>Reviews</h2>

      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className={styles.noreviews}>
          No reviews yet. Be the first to review this doctor!
        </p>
      ) : (
        reviews.map((rev) => (
          <div key={rev.id} className={styles.reviewitem}>
            <div className={styles.reviewerinfo}>
              <div className={styles.revieweravatar}>
                {(rev.users?.name?.charAt(0).toUpperCase()) || 'U'}
              </div>
              <div>
                <p className={styles.reviewername}>
                  {rev.users?.name || 'Anonymous'}
                </p>
                <p className={styles.reviewdate}>
                  {rev.created_at
                    ? new Date(rev.created_at).toLocaleDateString()
                    : ''}
                </p>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color={star <= (rev.rating || 0) ? '#facc15' : '#d1d5db'}
                      fill={star <= (rev.rating || 0) ? '#facc15' : 'none'}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className={styles.reviewtext}>"{rev.review}"</p>
          </div>
        ))
      )}

      {/*  Add Review Form - only if user can review */}
      {canReview && (
        <form className={styles.reviewform} onSubmit={handleSubmitReview}>
          <h3>Leave a Review</h3>
          <div className={styles.ratingstars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                onClick={() => setRating(star)}
                color={star <= rating ? '#facc15' : '#d1d5db'}
                fill={star <= rating ? '#facc15' : 'none'}
                className={styles.star}
              />
            ))}
          </div>
          <textarea
            className={styles.reviewtextarea}
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className={styles.submitreviewbtn}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </section>
  );
};

export default Reviews;
