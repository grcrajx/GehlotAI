import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onStartChat: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartChat }) => {
  const { login, user } = useAuth();

  const features = [
    {
      icon: <Sparkles className="text-yellow-500" />,
      title: "Smart Explanations",
      description: "Complex concepts explained simply with step-by-step solutions."
    },
    {
      icon: <BookOpen className="text-green-500" />,
      title: "All Subjects",
      description: "From Math to English, our AI tutor is ready to help across all disciplines."
    },
    {
      icon: <GraduationCap className="text-blue-500" />,
      title: "ELi5 Mode",
      description: "Ask'Explain Like I'm 5' for the simplest possible understanding."
    },
    {
      icon: <Clock className="text-purple-500" />,
      title: "Instant Summaries",
      description: "summarize long lessons or chapters into scannable notes in seconds."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <section className="text-center py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Personal AI Tutor
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            GehlotAI helps you master any subject with friendly, step-by-step guidance.
            Homework has never been this easy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartChat}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Learning Now
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-2xl text-lg font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              How it works
            </button>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-zinc-900 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to ace your exams?</h2>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
          Join thousands of students who are using GehlotAI to study smarter, not harder.
        </p>
        <button 
          onClick={onStartChat}
          className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-4 rounded-2xl font-bold transition-transform hover:scale-105"
        >
          Open Workspace
        </button>
      </section>
    </div>
  );
};

export default Home;
