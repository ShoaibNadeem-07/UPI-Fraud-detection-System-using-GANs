import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUserTransactions } from '../firebase/config';

const TransactionHistory = ({ user }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [stats, setStats] = useState({ total: 0, allowed: 0, blocked: 0, totalAmount: 0 });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchTransactions();
    }, [user]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const userTxs = await getUserTransactions(user.uid);

            // If no real transactions, use demo data
            if (userTxs.length === 0) {
                const demoTransactions = generateDemoTransactions();
                setTransactions(demoTransactions);
                calculateStats(demoTransactions);
            } else {
                setTransactions(userTxs);
                calculateStats(userTxs);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            const demoTransactions = generateDemoTransactions();
            setTransactions(demoTransactions);
            calculateStats(demoTransactions);
        }
        setLoading(false);
    };

    const generateDemoTransactions = () => {
        const demoData = [
            { id: '1', recipient: 'netflix@hdfc', amount: 649, riskLevel: 'LOW', status: 'ALLOWED', fraudScore: 0.12, timestamp: new Date(Date.now() - 3600000).toISOString(), explanation: 'Verified merchant, regular subscription' },
            { id: '2', recipient: 'swiggy@paytm', amount: 450, riskLevel: 'LOW', status: 'ALLOWED', fraudScore: 0.08, timestamp: new Date(Date.now() - 7200000).toISOString(), explanation: 'Trusted food delivery service' },
            { id: '3', recipient: 'scammer@unknown', amount: 25000, riskLevel: 'HIGH', status: 'BLOCKED', fraudScore: 0.95, timestamp: new Date(Date.now() - 10800000).toISOString(), explanation: '⚠️ Blacklisted recipient with 50+ complaints' },
            { id: '4', recipient: 'amazon@apl', amount: 2499, riskLevel: 'LOW', status: 'ALLOWED', fraudScore: 0.05, timestamp: new Date(Date.now() - 14400000).toISOString(), explanation: 'Verified e-commerce merchant' },
            { id: '5', recipient: 'newshop@ybl', amount: 5000, riskLevel: 'MEDIUM', status: 'VERIFY', fraudScore: 0.65, timestamp: new Date(Date.now() - 18000000).toISOString(), explanation: 'New merchant, requires verification' },
            { id: '6', recipient: 'uber@icici', amount: 380, riskLevel: 'LOW', status: 'ALLOWED', fraudScore: 0.03, timestamp: new Date(Date.now() - 21600000).toISOString(), explanation: 'Verified transport service' },
            { id: '7', recipient: 'kbc.prize@fake', amount: 10000, riskLevel: 'HIGH', status: 'BLOCKED', fraudScore: 0.98, timestamp: new Date(Date.now() - 86400000).toISOString(), explanation: '⚠️ KBC prize scam detected' },
            { id: '8', recipient: 'jio@icici', amount: 299, riskLevel: 'LOW', status: 'ALLOWED', fraudScore: 0.02, timestamp: new Date(Date.now() - 172800000).toISOString(), explanation: 'Telecom recharge, verified' },
            { id: '9', recipient: 'friend@paytm', amount: 1500, riskLevel: 'LOW', status: 'ALLOWED', fraudScore: 0.15, timestamp: new Date(Date.now() - 259200000).toISOString(), explanation: 'P2P transfer to known contact' },
            { id: '10', recipient: 'lottery@suspicious', amount: 50000, riskLevel: 'HIGH', status: 'BLOCKED', fraudScore: 0.92, timestamp: new Date(Date.now() - 345600000).toISOString(), explanation: '⚠️ Lottery scam attempt blocked' }
        ];
        return demoData;
    };

    const calculateStats = (txs) => {
        const total = txs.length;
        const allowed = txs.filter(t => t.status === 'ALLOWED').length;
        const blocked = txs.filter(t => t.status === 'BLOCKED').length;
        const totalAmount = txs.filter(t => t.status === 'ALLOWED').reduce((sum, t) => sum + t.amount, 0);
        setStats({ total, allowed, blocked, totalAmount });
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'allowed') return tx.status === 'ALLOWED';
        if (filter === 'blocked') return tx.status === 'BLOCKED';
        if (filter === 'high') return tx.riskLevel === 'HIGH';
        return true;
    }).sort((a, b) => {
        if (sortBy === 'date') return new Date(b.timestamp) - new Date(a.timestamp);
        if (sortBy === 'amount') return b.amount - a.amount;
        if (sortBy === 'risk') return b.fraudScore - a.fraudScore;
        return 0;
    });

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'HIGH': return 'text-red-700 bg-red-100 border border-red-200';
            case 'MEDIUM': return 'text-amber-700 bg-amber-100 border border-amber-200';
            default: return 'text-green-700 bg-green-100 border border-green-200';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'BLOCKED': return { icon: '🚫', text: 'Blocked', class: 'bg-red-50 text-red-600 border border-red-100' };
            case 'VERIFY': return { icon: '⚠️', text: 'Verified', class: 'bg-amber-50 text-amber-600 border border-amber-100' };
            default: return { icon: '✅', text: 'Allowed', class: 'bg-green-50 text-green-600 border border-green-100' };
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return date.toLocaleDateString();
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 brand-font">Please Sign In</h2>
                    <p className="text-slate-600 mb-6 font-medium">View your transaction history after signing in</p>
                    <button onClick={() => navigate('/')} className="btn-primary px-6 py-3 rounded-lg">
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 px-4 pb-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-slate-800 brand-font">Transaction History</h1>
                    <p className="text-slate-500 mt-1 font-medium">Your past transactions with fraud detection results</p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="glass-card p-4 rounded-xl text-center border border-slate-200">
                        <div className="text-2xl font-bold text-slate-800 brand-font">{stats.total}</div>
                        <div className="text-slate-500 font-medium text-sm">Total</div>
                    </div>
                    <div className="glass-card p-4 rounded-xl text-center border border-slate-200">
                        <div className="text-2xl font-bold text-green-600 brand-font">{stats.allowed}</div>
                        <div className="text-slate-500 font-medium text-sm">Allowed</div>
                    </div>
                    <div className="glass-card p-4 rounded-xl text-center border border-slate-200">
                        <div className="text-2xl font-bold text-red-600 brand-font">{stats.blocked}</div>
                        <div className="text-slate-500 font-medium text-sm">Blocked</div>
                    </div>
                    <div className="glass-card p-4 rounded-xl text-center border border-slate-200">
                        <div className="text-2xl font-bold text-emerald-600 brand-font">₹{(stats.totalAmount / 1000).toFixed(1)}K</div>
                        <div className="text-slate-500 font-medium text-sm">Spent</div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="flex flex-wrap gap-4 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex gap-2">
                        <span className="text-slate-500 font-medium self-center">Filter:</span>
                        {['all', 'allowed', 'blocked', 'high'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-lg text-sm capitalize font-medium transition-colors ${filter === f
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {f === 'high' ? 'High Risk' : f}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <span className="text-slate-500 font-medium self-center">Sort:</span>
                        {[
                            { key: 'date', label: 'Date' },
                            { key: 'amount', label: 'Amount' },
                            { key: 'risk', label: 'Risk' }
                        ].map(s => (
                            <button
                                key={s.key}
                                onClick={() => setSortBy(s.key)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${sortBy === s.key
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Transaction List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading transactions...</p>
                    </div>
                ) : (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {filteredTransactions.map((tx, index) => {
                            const statusBadge = getStatusBadge(tx.status);
                            return (
                                <motion.div
                                    key={tx.id}
                                    className={`glass-card p-5 rounded-xl border border-slate-200`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left: Transaction Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl">{statusBadge.icon}</div>
                                            <div>
                                                <div className="text-slate-800 font-bold">{tx.recipient}</div>
                                                <div className="text-slate-500 text-sm font-medium">{formatDate(tx.timestamp)}</div>
                                            </div>
                                        </div>

                                        {/* Center: Amount & Risk */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-800">₹{tx.amount.toLocaleString()}</div>
                                                <div className="text-slate-500 text-sm font-medium">Amount</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xl font-bold ${tx.riskLevel === 'HIGH' ? 'text-red-600' : tx.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-green-600'}`}>
                                                    {(tx.fraudScore * 100).toFixed(0)}%
                                                </div>
                                                <div className="text-slate-500 text-sm font-medium">Fraud Score</div>
                                            </div>
                                        </div>

                                        {/* Right: Status Badge */}
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getRiskColor(tx.riskLevel)}`}>
                                                {tx.riskLevel}
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusBadge.class}`}>
                                                {statusBadge.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Explanation */}
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            <span className="text-slate-800 font-bold">AI Explanation:</span> {tx.explanation}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">📭</div>
                                <p className="text-gray-400">No transactions found</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;
