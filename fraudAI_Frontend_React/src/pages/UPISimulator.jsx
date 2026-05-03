import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictUPIFraud } from '../services/api';
import { getUserData, saveTransaction } from '../firebase/config';
import ShapChart from '../components/ShapChart';

const DEMO_SCENARIOS = [
    {
        scenario: "Normal Netflix Subscription",
        recipient: "netflix@hdfc",
        amount: 649,
        expected_risk: "LOW",
        description: "Regular monthly subscription payment",
        icon: "🎬"
    },
    {
        scenario: "Phishing Attack - Fake Netflix",
        recipient: "netf1ix@unknown",
        amount: 649,
        expected_risk: "HIGH",
        description: "Payment to phishing ID impersonating Netflix",
        icon: "🎣"
    },
    {
        scenario: "Food Delivery Normal",
        recipient: "swiggy@paytm",
        amount: 450,
        expected_risk: "LOW",
        description: "Regular food delivery payment",
        icon: "🍕"
    },
    {
        scenario: "Payment to Blacklisted ID",
        recipient: "scammer001@ybl",
        amount: 5000,
        expected_risk: "HIGH",
        description: "Attempted payment to known fraudster",
        icon: "🚫"
    },
    {
        scenario: "Trusted P2P Transfer",
        recipient: "priya.patel@ybl",
        amount: 2000,
        expected_risk: "LOW",
        description: "Transfer between trusted users",
        icon: "🤝"
    },
    {
        scenario: "High Value to New Merchant",
        recipient: "newshop2026@paytm",
        amount: 50000,
        expected_risk: "MEDIUM",
        description: "Large payment to recently registered merchant",
        icon: "🏪"
    },
    {
        scenario: "KBC Prize Scam",
        recipient: "kbc.prize@fake",
        amount: 10000,
        expected_risk: "HIGH",
        description: "Payment for fake lottery/prize claim",
        icon: "🎰"
    },
    {
        scenario: "OLX Advance Payment Fraud",
        recipient: "olx.buyer@unknown",
        amount: 25000,
        expected_risk: "HIGH",
        description: "Advance payment for OLX listing scam",
        icon: "📦"
    },
    {
        scenario: "New User to Crypto Trader",
        recipient: "crypto.trader@suspicious",
        amount: 100000,
        expected_risk: "HIGH",
        description: "New account sending large sum to suspicious ID",
        icon: "💰"
    },
    {
        scenario: "Suspicious Amount Pattern",
        recipient: "netflix@hdfc",
        amount: 64900,
        expected_risk: "MEDIUM",
        description: "Abnormally high amount for streaming service",
        icon: "📊"
    }
];

const UPISimulator = ({ user, onLogin }) => {
    const [recipientUpi, setRecipientUpi] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [userUpi, setUserUpi] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userData = await getUserData(user.uid);
                if (userData) {
                    setUserUpi(userData.upiId);
                }
            }
        };
        fetchUserData();
    }, [user]);

    const handleVerify = async () => {
        if (!recipientUpi || !amount) {
            setError('Please fill in all fields');
            return;
        }

        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than 0');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const senderUpi = userUpi || `${user?.email?.split('@')[0] || 'guest'}@safepay`;
            const data = await predictUPIFraud(senderUpi, recipientUpi, amount);
            setResult(data);

            // Save transaction if user is logged in
            if (user) {
                await saveTransaction(user.uid, {
                    recipientUpi,
                    amount: parseFloat(amount),
                    fraud_score: data.fraud_score,
                    risk_level: data.risk_level,
                    prediction: data.prediction,
                    status: data.status
                });
            }
        } catch (err) {
            console.error('Prediction error:', err);
            setError(err.response?.data?.error || 'Failed to verify transaction. Make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = () => {
        if (result?.status === 'ALLOWED') {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setResult(null);
                setRecipientUpi('');
                setAmount('');
            }, 3000);
        }
    };

    const getRiskConfig = (riskLevel) => {
        const configs = {
            HIGH: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-600',
                icon: (
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                ),
                badge: 'risk-high'
            },
            MEDIUM: {
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-600',
                icon: (
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                ),
                badge: 'risk-medium'
            },
            LOW: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-600',
                icon: (
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                badge: 'risk-low'
            }
        };
        return configs[riskLevel] || configs.LOW;
    };

    // Login prompt for unauthenticated users
    if (!user) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-12 text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
                    <p className="text-gray-400 mb-8">
                        Please sign in with Google to use the UPI Transaction Simulator
                    </p>
                    <button onClick={onLogin} className="btn-primary w-full">
                        Sign in with Google
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 brand-font">
                        UPI Transaction Simulator
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Simulate real UPI payments and get instant fraud risk assessment with explainable AI
                    </p>
                </motion.div>

                {/* Success Overlay */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.5 }}
                                className="glass rounded-3xl p-12 text-center"
                            >
                                <div className="w-24 h-24 risk-low rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-2 brand-font">Payment Successful!</h2>
                                <p className="text-slate-600">₹{amount} sent to {recipientUpi}</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Transaction Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-2xl p-8 border border-slate-200"
                    >
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2 brand-font">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>New Transaction</span>
                        </h2>

                        {/* Sender Info */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="text-sm text-slate-500 mb-1 font-medium">Sending From</div>
                            <div className="flex items-center space-x-3">
                                <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-blue-300" />
                                <div>
                                    <div className="text-slate-800 font-semibold">{user.displayName}</div>
                                    <div className="text-blue-600 text-sm font-medium">{userUpi || `${user.email.split('@')[0]}@safepay`}</div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-600 text-sm mb-2 font-medium">Recipient UPI ID</label>
                                <input
                                    type="text"
                                    value={recipientUpi}
                                    onChange={(e) => setRecipientUpi(e.target.value)}
                                    placeholder="user@paytm"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 text-sm mb-2 font-medium">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="1"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-2xl font-bold"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>Verify Fraud Status</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Result Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl p-8 border border-slate-200"
                    >
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2 brand-font">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Risk Assessment</span>
                        </h2>

                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Risk Banner */}
                                    <div className={`${getRiskConfig(result.risk_level).bg} ${getRiskConfig(result.risk_level).border} border rounded-xl p-6 mb-6 shadow-sm`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className={`text-3xl font-bold brand-font ${getRiskConfig(result.risk_level).text}`}>
                                                    {result.risk_level} RISK
                                                </div>
                                                <div className="text-slate-600 mt-1 font-medium">{result.status}</div>
                                            </div>
                                            <div className={`${getRiskConfig(result.risk_level).text}`}>
                                                {getRiskConfig(result.risk_level).icon}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fraud Score */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-600 font-medium">Fraud Probability</span>
                                            <span className="text-slate-800 font-bold font-mono">{(result.fraud_score * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.fraud_score * 100}%` }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                className={`h-full rounded-full ${result.fraud_score >= 0.85 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                                        result.fraud_score >= 0.60 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-emerald-500 to-green-400'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div className="mb-6">
                                        <h3 className="text-slate-800 font-bold mb-2">AI Explanation</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{result.explanation}</p>
                                    </div>

                                    {/* SHAP Contributors */}
                                    {result.shap_contributors && result.shap_contributors.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-slate-800 font-bold mb-4">Top Risk Factors</h3>
                                            <ShapChart contributors={result.shap_contributors} />
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {result.status === 'ALLOWED' && (
                                        <button
                                            onClick={handleProceed}
                                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
                                        >
                                            ✅ Proceed with Payment
                                        </button>
                                    )}

                                    {result.status === 'VERIFY' && (
                                        <div className="space-y-3">
                                            <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-semibold transition-colors">
                                                ⚠️ Verify with OTP
                                            </button>
                                            <button
                                                onClick={() => setResult(null)}
                                                className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-semibold transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {result.status === 'BLOCKED' && (
                                        <button
                                            onClick={() => setResult(null)}
                                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                                        >
                                            🚫 Transaction Blocked — Go Back
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm">Enter transaction details and click "Verify Fraud Status" to see the risk assessment</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Quick Demo Scenarios */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10"
                >
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center brand-font">⚡ Quick Demo Scenarios</h2>
                    <p className="text-slate-500 text-center mb-6">
                        Click any scenario to auto-fill and test different fraud patterns
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DEMO_SCENARIOS.map((scenario, index) => {
                            const riskColors = {
                                LOW: 'border-green-500/30 hover:border-green-500/60',
                                MEDIUM: 'border-yellow-500/30 hover:border-yellow-500/60',
                                HIGH: 'border-red-500/30 hover:border-red-500/60'
                            };
                            const riskBadge = {
                                LOW: 'bg-green-500/20 text-green-400',
                                MEDIUM: 'bg-yellow-500/20 text-yellow-400',
                                HIGH: 'bg-red-500/20 text-red-400'
                            };
                            return (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setRecipientUpi(scenario.recipient);
                                        setAmount(String(scenario.amount));
                                        setResult(null);
                                        setError(null);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`glass-card rounded-xl p-4 text-left border ${riskColors[scenario.expected_risk]} transition-all cursor-pointer shadow-sm hover:shadow-md`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-2xl">{scenario.icon}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${riskBadge[scenario.expected_risk]} border ${riskColors[scenario.expected_risk]}`}>
                                            {scenario.expected_risk}
                                        </span>
                                    </div>
                                    <h3 className="text-slate-800 font-bold text-sm mb-1">{scenario.scenario}</h3>
                                    <p className="text-slate-500 text-xs mb-2 font-medium">{scenario.description}</p>
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span className="text-blue-600 font-mono">{scenario.recipient}</span>
                                        <span className="text-emerald-600 font-bold">₹{scenario.amount.toLocaleString()}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UPISimulator;
