import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = ({ user }) => {
    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Dataset Analyzer",
            description: "Upload CSV datasets for batch fraud analysis. Get SHAP explanations for every prediction.",
            link: "/analyzer",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "UPI Simulator",
            description: "Simulate real UPI transactions like PhonePe/GPay. Get instant fraud risk assessment.",
            link: "/simulator",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            title: "Explainable AI",
            description: "SHAP-powered explanations for every prediction. Understand why transactions are flagged.",
            link: "/analyzer",
            color: "from-orange-500 to-red-500"
        }
    ];

    const stats = [
        { value: "21", label: "Fraud Features" },
        { value: "82-85%", label: "Model Accuracy" },
        { value: "<100ms", label: "Prediction Time" },
        { value: "SHAP", label: "Explainability" }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="text-white">Real-Time</span>
                            <br />
                            <span className="gradient-text">UPI Fraud Detection</span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
                            Powered by XGBoost, NGBoost & SHAP explainability.
                            Detect fraudulent UPI transactions before money is transferred.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/simulator"
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-lg"
                            >
                                Try UPI Simulator
                            </Link>

                            <Link
                                to="/analyzer"
                                className="px-8 py-4 glass rounded-xl text-white font-semibold hover:bg-white/10 transition-all text-lg"
                            >
                                Analyze Dataset
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="glass rounded-2xl p-6 text-center card-hover">
                                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                                <div className="text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4">Two Powerful Modes</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Research validation with dataset analysis or real-world UPI simulation.
                            Both powered by the same ML models with full explainability.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    to={feature.link}
                                    className="block glass rounded-2xl p-8 card-hover h-full"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Risk Levels */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="glass rounded-3xl p-10"
                    >
                        <h2 className="text-3xl font-bold text-white text-center mb-10">Risk Assessment Levels</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-20 h-20 risk-low rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-green-400 mb-2">LOW RISK</h3>
                                <p className="text-gray-400">Score &lt; 0.60 — Transaction ALLOWED</p>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 risk-medium rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-yellow-400 mb-2">MEDIUM RISK</h3>
                                <p className="text-gray-400">Score ≥ 0.60 — Requires VERIFICATION</p>
                            </div>
                            <div className="text-center">
                                <div className="w-20 h-20 risk-high rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow text-red-500">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-red-400 mb-2">HIGH RISK</h3>
                                <p className="text-gray-400">Score ≥ 0.85 — Transaction BLOCKED</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
