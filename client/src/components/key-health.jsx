import { Leaf, HeartPulse, Brain, Zap, Droplet, Scale , Smile, Flame, Dumbbell ,Activity } from "lucide-react";

const benefits = [
  {

    icon: <Zap className="w-10 h-10 text-yellow-500" />,
    title: "Natural Energy",
    desc: "A balanced caffeine source that increases alertness and physical endurance naturally.",
  
  },
  {
    icon: <HeartPulse className="w-10 h-10 text-red-500" />,
    title: "Boosts Heart Health",
    desc: "May improve cholesterol levels and protect against heart disease with regular consumption.",
  },
  {
    icon: <Brain className="w-10 h-10 text-blue-500" />,
    title: "Enhances Focus",
    desc: "Provides a gentle energy boost and improved mental clarity without the jitters of coffee.",
  },
  {
    icon: <Leaf className="w-10 h-10 text-green-600" />,
    title: "Rich in Antioxidants",
    desc: "Rich in vitamins and minerals that keep your body healthy and strong.",
  },
  {
    icon: <Droplet className="w-10 h-10 text-cyan-500" />,
    title: "Supports Hydration",
    desc: "Keeps your body refreshed while providing essential vitamins and minerals.",
  },
  {
    icon: <Scale  className="w-10 h-10 text-purple-500" />,
    title: "Supports Weight Control",
    desc: "Speeds up metabolism and helps reduce food cravings.",
  },
  {
    icon: <Smile className="w-10 h-10 text-pink-500" />,
    title: "Mood Enhancer",
    desc: "Stimulates dopamine production, helping you feel more positive and motivated.",
  },
  {
    icon: <Flame className="w-10 h-10 text-orange-500" />,
    title: "Aids Digestion",
    desc: "Traditionally used to improve digestion and reduce bloating after meals.",
  },
  {
    icon: <Dumbbell   className="w-10 h-10 text-brown-500" />,
    title: "Good for Fitness & Stamina",
    desc: "Improves endurance and reduces tiredness — useful for active people.",
  },
];

export default function YerbaMateBenefits() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold font-heading text-center text-green mb-10">
          Why Drinking Mate?        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="flex items-start p-5 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-transform duration-300 cursor-pointer"
            >
              <div className="flex-shrink-0">{benefit.icon}</div>
              <div className="ml-4">
                <h3 className="text-lg font-body font-bold text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600 text-sm mt-1 font-body font-semibold ">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
