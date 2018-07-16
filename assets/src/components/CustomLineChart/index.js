// @flow

import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Props = {
  data: any[],
  xAxisKey: string,
  lineKey: string,
  color?: string,
  yAxisFormatter?: Function,
  tooltipFormatter?: Function,
}

class CustomLineChart extends React.Component<Props> { // TODO: zoom (use HighCharts?)
  render() {
    const { color = '#e5e5e5' } = this.props;
    return (
      <ResponsiveContainer minHeight={360}>
        <LineChart data={this.props.data}>
          <XAxis
            dataKey={this.props.xAxisKey}
            axisLine={{ stroke: '#e5e5e5', strokeWidth: 1 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={this.props.yAxisFormatter}
            axisLine={false}
            tickLine={false}
          />
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
          />
          <Line
            dataKey={this.props.lineKey}
            type="monotone"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Tooltip
            formatter={this.props.tooltipFormatter}
            wrapperStyle={{ border: 'none', boxShadow: '4px 4px 40px rgba(0, 0, 0, 0.05)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

export default CustomLineChart;
