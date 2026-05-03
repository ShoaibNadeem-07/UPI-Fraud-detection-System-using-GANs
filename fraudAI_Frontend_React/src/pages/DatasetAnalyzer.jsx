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
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 brand-font">
                        Dataset Fraud Analyzer
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
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
                        className={`upload-zone rounded-xl p-12 text-center border-2 border-dashed border-blue-300 bg-white/60 hover:bg-blue-50 transition-colors ${dragOver ? 'dragover' : ''}`}
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
                                <svg className="w-16 h-16 text-emerald-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-slate-800 text-lg font-semibold">{file.name}</p>
                                <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setResults(null); }}
                                    className="mt-4 text-red-500 hover:text-red-600 font-medium text-sm"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-slate-800 text-lg font-semibold mb-2">Drop your CSV file here</p>
                                <p className="text-slate-500 text-sm">or click to browse</p>
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
                                <div className="glass-card rounded-xl p-6 text-center border border-slate-200">
                                    <div className="text-3xl font-bold text-slate-800 brand-font">{results.summary.total_rows}</div>
                                    <div className="text-slate-500 font-medium text-sm">Total Rows</div>
                                </div>
                                <div className="glass-card rounded-xl p-6 text-center border border-slate-200">
                                    <div className="text-3xl font-bold text-red-600 brand-font">{results.summary.fraud_count}</div>
                                    <div className="text-slate-500 font-medium text-sm">Fraud Detected</div>
                                </div>
                                <div className="glass-card rounded-xl p-6 text-center border border-slate-200">
                                    <div className="text-3xl font-bold text-emerald-600 brand-font">{results.summary.non_fraud_count}</div>
                                    <div className="text-slate-500 font-medium text-sm">Legitimate</div>
                                </div>
                                {results.summary.accuracy && (
                                    <div className="glass-card rounded-xl p-6 text-center border border-slate-200">
                                        <div className="text-3xl font-bold text-blue-600 brand-font">{results.summary.accuracy}%</div>
                                        <div className="text-slate-500 font-medium text-sm">Accuracy</div>
                                    </div>
                                )}
                            </div>

                            {/* Risk Distribution */}
                            <div className="glass-card rounded-xl p-6 mb-8 border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 brand-font">Risk Distribution</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between bg-green-100 border border-green-200 rounded-lg p-4">
                                        <span className="text-green-700 font-medium">Low Risk</span>
                                        <span className="text-green-800 font-bold">{results.summary.low_risk_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-amber-100 border border-amber-200 rounded-lg p-4">
                                        <span className="text-amber-700 font-medium">Medium Risk</span>
                                        <span className="text-amber-800 font-bold">{results.summary.medium_risk_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-red-100 border border-red-200 rounded-lg p-4">
                                        <span className="text-red-700 font-medium">High Risk</span>
                                        <span className="text-red-800 font-bold">{results.summary.high_risk_count}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="glass-card rounded-xl overflow-hidden border border-slate-200">
                                <div className="p-6 border-b border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-800 brand-font">Analysis Results</h3>
                                    <p className="text-slate-500 text-sm">Click on a row to see SHAP explanation</p>
                                </div>

                                <div className="overflow-x-auto max-h-96">
                                    <table className="table-modern w-full">
                                        <thead className="sticky top-0 bg-slate-50">
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
                                                    className={`cursor-pointer ${selectedRow === index ? 'bg-blue-50' : 'bg-white'}`}
                                                >
                                                    <td className="text-slate-500 font-medium">{row.row_index + 1}</td>
                                                    <td>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${row.prediction === 1
                                                                ? 'bg-red-100 text-red-700 border border-red-200'
                                                                : 'bg-green-100 text-green-700 border border-green-200'
                                                            }`}>
                                                            {row.prediction === 1 ? 'FRAUD' : 'LEGIT'}
                                                        </span>
                                                    </td>
                                                    <td className="text-slate-800 font-mono font-semibold">{(row.fraud_score * 100).toFixed(1)}%</td>
                                                    <td>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${row.risk_level === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' : row.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                                            {row.risk_level}
                                                        </span>
                                                    </td>
                                                    <td className="text-slate-600 text-sm max-w-xs truncate">{row.explanation}</td>
                                                    {row.actual_label !== undefined && (
                                                        <td>
                                                            <span className={`px-2 py-1 rounded text-xs border font-medium ${row.correct
                                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                                    : 'bg-red-100 text-red-700 border-red-200'
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
                                        className="mt-4 glass-card rounded-xl p-6 border border-slate-200"
                                    >
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 brand-font">
                                            SHAP Explanation - Row {results.results[selectedRow].row_index + 1}
                                        </h3>
                                        <ShapChart contributors={results.results[selectedRow].shap_contributors} />
                                        <p className="text-slate-600 mt-4">{results.results[selectedRow].explanation}</p>
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
