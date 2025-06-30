import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  Target,
  Brain,
  Users,
  Award,
  ChevronRight,
  Play,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: BookOpen,
    title: "Teks Beragam Genre",
    description:
      "Koleksi lengkap teks naratif, ekspositori, deskriptif, prosedural, dan persuasif",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Latihan Soal Interaktif",
    description:
      "Soal literal, inferensial, dan HOTS dengan feedback real-time",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Brain,
    title: "Aktivitas HOTS",
    description:
      "Pengembangan kemampuan berpikir tingkat tinggi dengan rubrik penilaian",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Pantau perkembangan pembelajaran dengan analitik mendalam",
    color: "from-orange-500 to-red-500",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Wijaya",
    role: "Guru Bahasa Indonesia",
    content:
      "Platform ini sangat membantu siswa mengembangkan kemampuan pemahaman bacaan dengan metode yang sistematis.",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
  },
  {
    name: "Ahmad Rizki",
    role: "Siswa SMA",
    content:
      "Belajar jadi lebih menyenangkan dengan berbagai aktivitas HOTS yang menantang kemampuan berpikir.",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
  },
  {
    name: "Prof. Indira Sari",
    role: "Kepala Sekolah",
    content:
      "Hasil pembelajaran siswa meningkat signifikan setelah menggunakan platform SMArtClass.",
    avatar:
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150",
    rating: 5,
  },
];

const stats = [
  { number: "10,000+", label: "Siswa Aktif", icon: Users },
  { number: "500+", label: "Teks Bacaan", icon: BookOpen },
  { number: "95%", label: "Tingkat Kepuasan", icon: Star },
  { number: "50+", label: "Sekolah Partner", icon: Award },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-2xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SMArtClass
            </span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
          >
            Masuk / Daftar
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full"
              >
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Platform Pembelajaran Terdepan
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tingkatkan
                </span>
                <br />
                <span className="text-gray-900">Pemahaman</span>
                <br />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Membaca
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Platform pembelajaran inovatif untuk mengembangkan kemampuan
                pemahaman bacaan siswa SMA dengan metode HOTS dan analitik
                mendalam.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Mulai Belajar</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                <Play className="h-5 w-5" />
                <span>Lihat Demo</span>
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-6 pt-8"
            >
              {stats.slice(0, 2).map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-3xl font-bold text-gray-900">
                      {stat.number}
                    </span>
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Teks Naratif
                    </h3>
                    <p className="text-sm text-gray-500">Legenda Timun Mas</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Progress Membaca
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      85%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ delay: 1, duration: 1.5 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["Literal", "Inferensial", "HOTS"].map((type, index) => (
                    <motion.div
                      key={type}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="text-center p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="text-lg font-bold text-gray-900">
                        {8 + index}
                      </div>
                      <div className="text-xs text-gray-500">{type}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Star className="h-8 w-8 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5], rotate: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="h-6 w-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            Fitur{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Unggulan
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Teknologi pembelajaran terdepan untuk mengoptimalkan kemampuan
            pemahaman bacaan
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 py-20"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-16"
          >
            Apa Kata Mereka?
          </motion.h2>

          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex justify-center mb-6">
              {[...Array(testimonials[currentTestimonial].rating)].map(
                (_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-yellow-400 fill-current"
                  />
                )
              )}
            </div>

            <blockquote className="text-xl text-gray-700 mb-8 leading-relaxed">
              "{testimonials[currentTestimonial].content}"
            </blockquote>

            <div className="flex items-center justify-center space-x-4">
              <img
                src={testimonials[currentTestimonial].avatar}
                alt={testimonials[currentTestimonial].name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="font-bold text-gray-900">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-gray-600">
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.05 }}
              className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
          >
            Siap Meningkatkan Kemampuan Membaca?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8 opacity-90"
          >
            Bergabunglah dengan ribuan siswa yang telah merasakan manfaat
            platform SMArtClass
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <span>Mulai Sekarang</span>
            <Zap className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">SMArtClass</span>
          </div>
          <p className="text-gray-400 mb-6">
            Platform Pemahaman Membaca untuk Siswa SMA
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2024 SMArtClass. All rights reserved.</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
