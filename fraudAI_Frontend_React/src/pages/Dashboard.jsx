import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Dashboard = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalTransactions: 0,
        fraudBlocked: 0,
        amountProtected: 0,
        avgRiskScore: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [riskDistribution, setRiskDistribution] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [isLive, setIsLive] = useState(true);

    useEffect(() => {
        // Initialize demo data
        generateDemoData();

        // Simulate live updates
        const interval = setInterval(() => {
            if (isLive) {
                addLiveTransaction();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isLive]);

    const generateDemoData = () => {
        // Demo statistics
        setStats({
            totalTransactions: 1247,
            fraudBlocked: 23,
            amountProtected: 847500,
            avgRiskScore: 0.18
        });

        // Risk distribution
        setRiskDistribution([
            { name: 'Low Risk', value: 1180, color: '#10b981' },
            { name: 'Medium Risk', value: 44, color: '#f59e0b' },
            { name: 'High Risk', value: 23, color: '#ef4444' }
        ]);

        // Hourly transaction data
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push({
                hour: `${i}:00`,
                transactions: Math.floor(Math.random() * 80) + 20,
                fraudAttempts: Math.floor(Math.random() * 5)
            });
        }
        setHourlyData(hours);

        // Recent transactions
        setRecentTransactions([
            { id: 1, sender: 'user@safepay', recipient: 'netflix@hdfc', amount: 649, risk: 'LOW', time: '2 min ago', status: 'ALLOWED' },
            { id: 2, sender: 'customer@ybl', recipient: 'amazon@apl', amount: 2499, risk: 'LOW', time: '5 min ago', status: 'ALLOWED' },
            { id: 3, sender: 'victim@paytm', recipient: 'scammer@unknown', amount: 50000, risk: 'HIGH', time: '8 min ago', status: 'BLOCKED' },
            { id: 4, sender: 'shopper@icici', recipient: 'flipkart@hdfc', amount: 1299, risk: 'LOW', time: '12 min ago', status: 'ALLOWED' },
            { id: 5, sender: 'new_user@ybl', recipient: 'suspicious@fake', amount: 25000, risk: 'HIGH', time: '15 min ago', status: 'BLOCKED' }
        ]);
    };

    const addLiveTransaction = () => {
        const senders = ['user123@paytm', 'customer@ybl', 'shopper@icici', 'buyer@hdfc'];
        const recipients = [
            { id: 'netflix@hdfc', risk: 'LOW', status: 'ALLOWED' },
            { id: 'amazon@apl', risk: 'LOW', status: 'ALLOWED' },
            { id: 'swiggy@paytm', risk: 'LOW', status: 'ALLOWED' },
            { id: 'suspicious@unknown', risk: 'HIGH', status: 'BLOCKED' },
            { id: 'newshop@fake', risk: 'MEDIUM', status: 'VERIFY' }
        ];

        const recipient = recipients[Math.floor(Math.random() * recipients.length)];
        const newTx = {
            id: Date.now(),
            sender: senders[Math.floor(Math.random() * senders.length)],
            recipient: recipient.id,
            amount: Math.floor(Math.random() * 5000) + 100,
            risk: recipient.risk,
            time: 'Just now',
            status: recipient.status
        };

        setRecentTransactions(prev => [newTx, ...prev.slice(0, 9)]);

        // Update stats
        setStats(prev => ({
            ...prev,
            totalTransactions: prev.totalTransactions + 1,
            fraudBlocked: recipient.risk === 'HIGH' ? prev.fraudBlocked + 1 : prev.fraudBlocked,
            amountProtected: recipient.risk === 'HIGH' ? prev.amountProtected + newTx.amount : prev.amountProtected
        }));
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'HIGH': return 'text-red-400 bg-red-500/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
            default: return 'text-green-400 bg-green-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'BLOCKED': return '🚫';
            case 'VERIFY': return '⚠️';
            default: return '✅';
        }
    };

    return (
        <div className="min-h-screen pt-20 px-4 pb-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="flex justify-between items-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Real-Time Dashboard</h1>
                        <p className="text-gray-400 mt-1">Live fraud monitoring & analytics</p>
                    </div>
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isLive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                        {isLive ? 'LIVE' : 'PAUSED'}
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="glass-card p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-1">Total Transactions</div>
                        <div className="text-3xl font-bold text-white">{stats.totalTransactions.toLocaleString()}</div>
                        <div className="text-green-400 text-sm mt-2">↑ 12% from yesterday</div>
                    </div>
                    <div className="glass-card p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-1">Fraud Blocked</div>
                        <div className="text-3xl font-bold text-red-400">{stats.fraudBlocked}</div>
                        <div className="text-red-400 text-sm mt-2">🛡️ Protected today</div>
                    </div>
                    <div className="glass-card p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-1">Amount Protected</div>
                        <div className="text-3xl font-bold text-emerald-400">₹{(stats.amountProtected / 1000).toFixed(1)}K</div>
                        <div className="text-emerald-400 text-sm mt-2">💰 Saved from fraud</div>
                    </div>
                    <div className="glass-card p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-1">Avg Risk Score</div>
                        <div className="text-3xl font-bold text-blue-400">{(stats.avgRiskScore * 100).toFixed(1)}%</div>
                        <div className="text-blue-400 text-sm mt-2">📊 Network health</div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Transaction Feed */}
                    <motion.div
                        className="lg:col-span-2 glass-card p-6 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Live Transaction Stream
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {recentTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getStatusIcon(tx.status)}</span>
                                        <div>
                                            <div className="text-white text-sm">{tx.sender} → {tx.recipient}</div>
                                            <div className="text-gray-500 text-xs">{tx.time}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-white font-medium">₹{tx.amount.toLocaleString()}</div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(tx.risk)}`}>
                                            {tx.risk}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Risk Distribution Pie Chart */}
                    <motion.div
                        className="glass-card p-6 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Risk Distribution</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4">
                            {riskDistribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-gray-400 text-sm">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Hourly Activity Chart */}
                <motion.div
                    className="glass-card p-6 rounded-xl mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold text-white mb-4">24-Hour Activity</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="fraudAttempts" fill="#ef4444" name="Fraud Attempts" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
