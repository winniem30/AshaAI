import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { VoiceChatbot } from "@/components/voice-chatbot";
import { useLanguage } from "@/contexts/language-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AshaAI - Discover Government" },
      {
        name: "description",
        content:
          "AshaAI is an AI-powered navigator for Indian scholarships, schemes, grants and verified official portals.",
      },
      { property: "og:title", content: "AshaAI - Discover Government" },
      {
        property: "og:description",
        content: "One conversation. Thousands of opportunities ranked, explained and ready to apply.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const categories = ["Scholarships", "Internships", "Fellowships", "Grants", "Hackathons"];
  const { language, setLanguage, t } = useLanguage();
  
  const languages = [
    { code: "english", name: "English", flag: "🇬🇧" },
    { code: "hindi", name: "Hindi", flag: "🇮🇳" },
    { code: "telugu", name: "Telugu", flag: "🇮🇳" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative border-b border-white/10 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link to="/" className="text-2xl font-extrabold tracking-tighter">
              AshaAI
            </Link>
          </motion.div>
          <div className="hidden md:flex items-center gap-8">
            {["Discover", "Protection", "How it works", "Browse", "Eligibility"].map((item) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  to={item === "Discover" ? "/" : item === "Protection" ? "/trusted-browser" : item === "Browse" ? "/opportunities" : item === "Eligibility" ? "/eligibility" : "/"}
                  className="text-sm font-medium hover:text-purple-300 transition-colors"
                >
                  {item === "Discover" ? t("nav.discover") : item === "Protection" ? t("nav.protection") : item === "How it works" ? t("nav.howItWorks") : item === "Browse" ? t("nav.browse") : t("nav.eligibility")}
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="relative"
            >
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors appearance-none cursor-pointer pr-8"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-purple-900 text-white">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
                ▼
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="bg-white text-purple-900 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors shadow-lg shadow-purple-500/30"
              >
                {t("nav.login")}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="relative z-10 text-center py-16 md:py-24 px-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-sm font-semibold text-purple-300 mb-3 tracking-wider"
          >
            {t("intro.title")}
          </motion.p>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-8xl font-extrabold leading-tight mb-6"
          >
            {t("hero.title")}
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
              {t("hero.subtitle")}
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
          >
            {t("hero.description")}
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link
                to="/eligibility"
                className="bg-white text-purple-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors shadow-lg shadow-purple-500/30"
              >
                {t("nav.getStarted")}
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-colors shadow-lg shadow-purple-500/30"
            >
              {t("hero.seeWhatItDoes")}
            </motion.button>
          </motion.div>
        </div>

        {/* Categories */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 py-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
              >
                {category.toUpperCase()}
              </motion.button>
            ))}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-purple-500/30 backdrop-blur-sm border border-purple-400/30 rounded-full text-sm font-medium hover:bg-purple-500/40 transition-colors"
            >
              {t("hero.keepExploring")}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Voice Chatbot */}
      <VoiceChatbot />
    </div>
  );
}
