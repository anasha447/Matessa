import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import img1 from "../assets/custmer1.webp";
import img2 from "../assets/customer2.webp";
import img3 from "../assets/customer3.webp";


const reviews = [
  {
    id: 1,
    name: "Amit Sharma",
    photo: img1 ,
    stars: 5,
    review: "Matessa mate with masala became favorite ritual drink every morning",
  },
  {
    id: 2,
    name: "Ghoro Vishal",
    photo: img3 ,
    stars: 5,
    review: "Love the refreshing taste of mate and Indian spices together.",
  },
  {
    id: 3,
    name: "Rahul Mehta",
    photo: img2,
    stars: 4,
    review: "Great for work sessions, keeps me focused.",
  },
  
];

const CustomerReviews = () => {
  return (
    <section className="py-16 px-6 bg-white lg:mt-30 sm:mt-20 mt-10">
      <h2 className="text-3xl font-bold font-heading text-center mt-5 text-green  mb-5">
       Customers Reviews
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
              className="mx-auto mb-4 h-[400px] w-full object-cover rounded-lg shadow-md"
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
