import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

const ShapChart = ({ contributors }) => {
    if (!contributors || contributors.length === 0) {
        return (
            <div className="text-gray-500 text-center py-4">
                No SHAP data available
            </div>
        );
    }

    // Prepare data for chart
    const data = contributors.map(c => ({
        name: c.feature.length > 20 ? c.feature.substring(0, 20) + '...' : c.feature,
        fullName: c.feature,
        value: c.impact,
        direction: c.direction
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass px-4 py-2 rounded-lg">
                    <p className="text-white text-sm font-semibold">{data.fullName}</p>
                    <p className={`text-sm ${data.value > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        Impact: {data.value > 0 ? '+' : ''}{data.value.toFixed(4)}
                    </p>
                    <p className="text-gray-400 text-xs">
                        {data.direction === 'increases' ? '↑ Increases fraud risk' : '↓ Decreases fraud risk'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={Math.max(200, contributors.length * 40)}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                    <XAxis
                        type="number"
                        hide
                        domain={['dataMin', 'dataMax']}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={150}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.value > 0 ? '#ef4444' : '#22c55e'}
                                style={{ filter: `drop-shadow(0 0 6px ${entry.value > 0 ? '#ef4444' : '#22c55e'}40)` }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span className="text-gray-400">Increases Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-gray-400">Decreases Risk</span>
                </div>
            </div>
        </div>
    );
};

export default ShapChart;
