import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from "react";

const ReviewSlider = () => {
  const [ReviewData, setReviews] = useState([]);
  const { id } = useParams();

  useEffect(() => {
      fetch(`/api/products/${id}/reviews?page=1&per_page=5`)
        .then(res => res.json())
        .then(data => setReviews(data.reviews))  
        .catch(err => console.error("Error fetching reviews:", err));
    }, [id]);


  const settings = {
    dots: true,
    arrows: false,
    infinite: ReviewData.length > 1,
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    pauseOnHover: true,
    pauseOnFocus: true,
    centerMode: ReviewData.length < 2,
    centerPadding: "600px",
    responsive: [
      { breakpoint: 10000, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="py-10 mb-10">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="inline-block mb-3 text-sm font-semibold tracking-wider text-blue-600 uppercase">
            Testimonials
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Reviews
          </h1>
          <p className="text-xs text-gray-400">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit asperiores modi.
          </p>
          <Link
            to={`/product/${id}/reviews`}
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition duration-300"
          >
            View All Reviews
          </Link>
        </div>


        {/* Slider */}
        <div data-aos="zoom-in">
          <Slider {...settings}>
            {/* Cards*/}
            {ReviewData.map((data) => (
              <div key={data.id} className="my-6">
                <div className="flex flex-col gap-4 shadow-lg py-8 px-6 mx-4 rounded-xl bg-sky-100 bg-primary/10 relative">
                  <div className="mb-2">
                    <img
                      src={`/api/profile-image/${data.profile_pic}`}
                      alt={data.name}
                      className="rounded-full w-20 h-20 mx-auto"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="space-y-3 text-center">
                      <p className="text-xs text-gray-500">{data.text}</p>
                      <p className="text-yellow-500 text-sm">
                      {'★'.repeat(data.rating)}<span className="text-gray-300">{'★'.repeat(5 - data.rating)}</span></p>
                      <h1 className="text-xl font-bold text-black/80 dark:text-light">
                        {data.name}
                      </h1>
                    </div>
                  </div>
                  <p className="text-black/20 text-9xl font-serif absolute top-0 right-0">
                    ,,
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default ReviewSlider;