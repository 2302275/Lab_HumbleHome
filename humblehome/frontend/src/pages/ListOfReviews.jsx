import { useEffect, useState } from "react";

// const ReviewData = [
//   { id: 1, name: "Victor", text: "Lorem ipsum dolor sit amet consectetur..." },
//   { id: 2, name: "Satya Nadella", text: "Lorem ipsum dolor sit amet consectetur..." },
//   { id: 3, name: "Virat Kohli", text: "Lorem ipsum dolor sit amet consectetur..." },
//   { id: 5, name: "Sachin Tendulkar", text: "Lorem ipsum dolor sit amet consectetur..." },
// ];

export default function ListOfReviews() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', text: '', rating: 0 });
  //For sql implementation
  const [ReviewData, setReviews] = useState([]);

  //For sql implementation
  useEffect(() => {
    fetch('http://localhost:5000/reviews')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error('Error fetching reviews:', err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setForm({ ...form, rating: value });
  };

  //add async
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Review submitted:', form);
    // setShowModal(false);
    // setForm({ name: '', text: '', rating: 0 });

          try {
        const response = await fetch('http://localhost:5000/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        if (response.ok) {
          const newReview = await response.json();
          setReviews(prev => [newReview, ...prev].sort((a, b) => b.rating - a.rating));
          setShowModal(false);
          setForm({ name: '', text: '', rating: 0 });
        } else {
          alert('Failed to submit review');
        }
      } catch (err) {
        console.error(err);
        alert('Error submitting review');
      }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Customer Reviews</h2>

      {/* <table className="table-auto w-full mb-4 border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Review</th>
          </tr>
        </thead>
        <tbody>
          {ReviewData.map(({ id, name, text }) => (
            <tr key={id}>
              <td className="border px-4 py-2">{name}</td>
              <td className="border px-4 py-2">{text}</td>
            </tr>
          ))}
        </tbody>
      </table> */}

        <ul className="flex flex-col gap-3 mt-14">
    {ReviewData.map(({ id, name, text, rating }) => (
      <li key={id} className="flex flex-col gap-4 bg-sky-100 p-4 rounded-md">
        {/* Profile and Rating */}
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white font-bold uppercase">
              {name?.[0] || 'U'}
            </div>
            <span>{name}</span>
          </div>
           <p className="text-yellow-500 text-sm">
                      {'★'.repeat(rating)}<span className="text-gray-300">{'★'.repeat(5 - rating)}</span></p>
        </div>

        {/* Review Text */}
        <div>{text}</div>

        {/* Date and Share Button */}
        <div className="flex justify-between text-sm text-black">
          <span>{new Date().toLocaleDateString()}</span>
          <button className="p-1 px-2 bg-sky-500/50 hover:bg-sky-500/70 border border-gray-950 bg-opacity-60 text-black flex items-center gap-1">
            <ion-icon name="share-outline"></ion-icon>
            Share
          </button>
        </div>
      </li>
    ))}
  </ul>
    <div className="text-center">
            <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Add Review
        </button></div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Submit a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full border px-3 py-2 rounded"
                required
              />
              <textarea
                name="text"
                value={form.text}
                onChange={handleChange}
                placeholder="Your Review"
                className="w-full border px-3 py-2 rounded"
                required
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`cursor-pointer text-xl ${
                      form.rating >= star ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:underline"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
