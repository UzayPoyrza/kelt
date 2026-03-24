import { Link } from "react-router";
import { motion } from "motion/react";
import { Pause, Music, Brain, Sparkles, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Landing() {
  const features = [
    {
      icon: Pause,
      title: "Pause-Aware Intelligence",
      description: "Our AI understands natural speech patterns, creating perfectly timed pauses that feel authentic and allow for deeper reflection."
    },
    {
      icon: Music,
      title: "Studio-Quality Audio",
      description: "Every meditation is professionally mixed and mastered with spatial audio, binaural beats, and carefully crafted soundscapes."
    },
    {
      icon: Brain,
      title: "Adaptive Guidance",
      description: "Advanced AI adapts to your preferences, creating personalized meditations that evolve with your practice."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1673219498641-e54db77132a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMG1lZGl0YXRpb24lMjBtaW5pbWFsfGVufDF8fHx8MTc3NDMyMzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Peaceful meditation"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/70 to-white" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>The Future of Guided Meditation</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl tracking-tight mb-6 text-gray-900">
              Meditation that
              <br />
              <span className="text-indigo-600">feels human</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              AI-generated meditations with natural pauses, studio-quality audio,
              and adaptive guidance that evolves with you.
            </p>
            
            <Link to="/generate">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25"
              >
                Create Your Meditation
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl tracking-tight mb-4 text-gray-900">
              What makes us different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've reimagined guided meditation from the ground up, combining cutting-edge AI
              with professional audio engineering.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl tracking-tight mb-6 text-gray-900">
              Professional quality,
              <br />
              infinite possibilities
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Most meditation apps use robotic text-to-speech with unnatural pacing.
              We use advanced AI that understands the rhythm of human speech, creating
              pauses that feel intentional and allow your mind to truly settle.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every meditation is mixed with studio-grade processing, spatial audio,
              and carefully selected ambient soundscapes that enhance your practice
              without overwhelming it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1634557269380-f3c53b557901?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwbmF0dXJlJTIwemVufGVufDF8fHx8MTc3NDMyMzY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Calm nature"
              className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl tracking-tight mb-6 text-gray-900">
              Ready to experience the difference?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Create a personalized meditation in seconds. No subscription required.
            </p>
            <Link to="/generate">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 MindFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}