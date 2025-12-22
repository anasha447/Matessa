import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import img1 from "../assets/review1.jpg";
import img2 from "../assets/review2.jpg";
import img3 from "../assets/review3.jpg";


const reviews = [
  {
    id: 1,
    name: "Amit Sharma",
    photo: img1 ,
    stars: 5,
    review: "Matessa mate with masala is my go-to energy drink every morning!",
  },
  {
    id: 2,
    name: "Priya Verma",
    photo: img2 ,
    stars: 4,
    review: "Love the refreshing taste of mate and Indian spices together.",
  },
  {
    id: 3,
    name: "Rahul Mehta",
    photo: img3,
    stars: 5,
    review: "Great companion for late-night work sessions, keeps me focused.",
  },
  {
    id: 4,
    name: "Neha Singh",
    photo: "/images/customers/customer4.jpg",
    stars: 4,
    review: "Healthy and energizing alternative to coffee.",
  },
  {
    id: 5,
    name: "Arjun Patel",
    photo: "/images/customers/customer5.jpg",
    stars: 5,
    review: "Absolutely love the aroma and taste, highly recommend!",
  },
  {
    id: 6,
    name: "Sneha Gupta",
    photo: "/images/customers/customer6.jpg",
    stars: 5,
    review: "Best discovery for my fitness lifestyle, keeps me active!",
  },
];

const CustomerReviews = () => {
  return (
    <section className="py-16 px-6 bg-white lg:mt-30 sm:mt-20 mt-10">
      <h2 className="text-3xl font-bold font-heading text-center text-green  mb-5">
        What Our Customers Says
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            {/* Customer Image */}
            <img
              src={review.photo}
              alt={review.name}
              className="mx-auto mb-4 h-[300px] w-full object-cover rounded-lg shadow-md"
            />

            {/* Name */}
            <h3 className="text-lg font-semibold text-center">{review.name}</h3>

            {/* Stars */}
            <div className="flex justify-center my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={`${
                    i < review.stars ? "text-lightgreen fill-lightgreen" : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Review */}
            <p className="text-gray-600 text-center">{review.review}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CustomerReviews;
