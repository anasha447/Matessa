// src/components/OurStoryLottie.jsx
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const OurStoryLottie = () => {
  return (
    <section className="bg-creamy py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <DotLottieReact
          src="/mate-cup.lottie" // put the .lottie file in /public
          loop
          autoplay
          style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
        />
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
        >
          <h2 className="text-3xl font-heading text-darkgreen mb-6">
            The Fusion Story
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Imagine the bold energy of mate and the soulful warmth of Indian masala
            blending into one cup. That’s Indian Mate — the world’s best traditions in harmony.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStoryLottie;
