import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeDataset } from '../services/api';
import ShapChart from '../components/ShapChart';

const DatasetAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please upload a CSV file');
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const data = await analyzeDataset(file);
            setResults(data);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.response?.data?.error || 'Failed to analyze dataset. Make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskBadge = (riskLevel) => {
        const styles = {
            HIGH: 'bg-red-500/20 text-red-400 border-red-500/50',
            MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            LOW: 'bg-green-500/20 text-green-400 border-green-500/50'
        };
        return styles[riskLevel] || styles.LOW;
    };

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Dataset Fraud Analyzer
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Upload your CSV dataset for batch fraud analysis. Get predictions, risk levels,
                        and SHAP explanations for each transaction.
                    </p>
                </motion.div>

                {/* Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-8 mb-8"
                >
                    <div
                        className={`upload-zone rounded-xl p-12 text-center ${dragOver ? 'dragover' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <svg className="w-16 h-16 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-white text-lg font-semibold">{file.name}</p>
                                <p className="text-gray-400 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setResults(null); }}
                                    className="mt-4 text-red-400 hover:text-red-300 text-sm"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <svg className="w-16 h-16 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-white text-lg font-semibold mb-2">Drop your CSV file here</p>
                                <p className="text-gray-400 text-sm">or click to browse</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <span>Analyze Dataset</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="glass rounded-xl p-6 text-center">
                                    <div className="text-3xl font-bold text-white">{results.summary.total_rows}</div>
                                    <div className="text-gray-400 text-sm">Total Rows</div>
                                </div>
                                <div className="glass rounded-xl p-6 text-center">
                                    <div className="text-3xl font-bold text-red-400">{results.summary.fraud_count}</div>
                                    <div className="text-gray-400 text-sm">Fraud Detected</div>
                                </div>
                                <div className="glass rounded-xl p-6 text-center">
                                    <div className="text-3xl font-bold text-green-400">{results.summary.non_fraud_count}</div>
                                    <div className="text-gray-400 text-sm">Legitimate</div>
                                </div>
                                {results.summary.accuracy && (
                                    <div className="glass rounded-xl p-6 text-center">
                                        <div className="text-3xl font-bold gradient-text">{results.summary.accuracy}%</div>
                                        <div className="text-gray-400 text-sm">Accuracy</div>
                                    </div>
                                )}
                            </div>

                            {/* Risk Distribution */}
                            <div className="glass rounded-xl p-6 mb-8">
                                <h3 className="text-xl font-bold text-white mb-4">Risk Distribution</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-4">
                                        <span className="text-green-400">Low Risk</span>
                                        <span className="text-white font-bold">{results.summary.low_risk_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-yellow-500/10 rounded-lg p-4">
                                        <span className="text-yellow-400">Medium Risk</span>
                                        <span className="text-white font-bold">{results.summary.medium_risk_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-red-500/10 rounded-lg p-4">
                                        <span className="text-red-400">High Risk</span>
                                        <span className="text-white font-bold">{results.summary.high_risk_count}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="glass rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white">Analysis Results</h3>
                                    <p className="text-gray-400 text-sm">Click on a row to see SHAP explanation</p>
                                </div>

                                <div className="overflow-x-auto max-h-96">
                                    <table className="table-modern w-full">
                                        <thead className="sticky top-0">
                                            <tr>
                                                <th>#</th>
                                                <th>Prediction</th>
                                                <th>Fraud Score</th>
                                                <th>Risk Level</th>
                                                <th>Explanation</th>
                                                {results.results[0]?.actual_label !== undefined && <th>Actual</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.results.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    onClick={() => setSelectedRow(selectedRow === index ? null : index)}
                                                    className={`cursor-pointer ${selectedRow === index ? 'bg-purple-500/20' : ''}`}
                                                >
                                                    <td className="text-gray-400">{row.row_index + 1}</td>
                                                    <td>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${row.prediction === 1
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-green-500/20 text-green-400'
                                                            }`}>
                                                            {row.prediction === 1 ? 'FRAUD' : 'LEGIT'}
                                                        </span>
                                                    </td>
                                                    <td className="text-white font-mono">{(row.fraud_score * 100).toFixed(1)}%</td>
                                                    <td>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBadge(row.risk_level)}`}>
                                                            {row.risk_level}
                                                        </span>
                                                    </td>
                                                    <td className="text-gray-300 text-sm max-w-xs truncate">{row.explanation}</td>
                                                    {row.actual_label !== undefined && (
                                                        <td>
                                                            <span className={`px-2 py-1 rounded text-xs ${row.correct
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                {row.actual_label === 1 ? 'Fraud' : 'Legit'}
                                                                {row.correct ? ' ✓' : ' ✗'}
                                                            </span>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* SHAP Detail Panel */}
                            <AnimatePresence>
                                {selectedRow !== null && results.results[selectedRow] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 glass rounded-xl p-6"
                                    >
                                        <h3 className="text-xl font-bold text-white mb-4">
                                            SHAP Explanation - Row {results.results[selectedRow].row_index + 1}
                                        </h3>
                                        <ShapChart contributors={results.results[selectedRow].shap_contributors} />
                                        <p className="text-gray-300 mt-4">{results.results[selectedRow].explanation}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DatasetAnalyzer;
