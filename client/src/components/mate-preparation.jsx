import { motion } from "framer-motion";
import heatwater from "../assets/videos/5.mp4";
import secondvideo from "../assets/videos/6.mp4";
import thirdvideo from "../assets/videos/7.mp4";
import forthvideo from "../assets/videos/4.mp4";

const steps = [
  { step: "Heat Water", icon: "🔥", video: heatwater },
  { step: "Add Mate Leaves", icon: "🌿", video: secondvideo },
  { step: "Pour into Gourd", icon: "🥤", video: thirdvideo },
  { step: "Sip with Bombilla", icon: "🥄", video: forthvideo },
];

export default function PreparationSteps() {
  return (
    <section className="py-16 bg-green-50">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-green-900">How to Prepare Mate</h2>
        <p className="text-lg text-green-700 mt-2">Follow these simple steps</p>
      </div>

      {/* Timeline Container */}
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Line (horizontal on desktop, vertical on mobile) */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-green-300" />
        <div className="md:hidden absolute left-6 top-0 h-full w-1 bg-green-300" />

        {/* Steps */}
        <div className="grid md:grid-cols-4 grid-cols-1 gap-16 relative z-10">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
              className="flex md:flex-col items-center md:text-center gap-4"
            >
              {/* Video inside circular border */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full p-[4px] bg-gradient-to-br from-green-300 to-green-700 shadow-lg overflow-hidden"
                >
                  <video
                    src={s.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-full"
                  />
                </motion.div>
              </div>
              <p className="text-green-800 font-medium">{s.step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
