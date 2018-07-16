// @flow

import * as React from 'react';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from 'recharts';

type Props = {
  data: any[],
  nameKey: string,
  dataKey: string,
}

type State = {
  activeIndex: number,
};

class CustomPieChart extends React.Component<Props, State> {
  state = {
    activeIndex: 0,
  };

  onMouseEnter = (data: any[], index: number) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    return (
      <ResponsiveContainer minHeight={260}>
        <PieChart>
          <Pie
            data={this.props.data}
            nameKey={this.props.nameKey}
            dataKey={this.props.dataKey}
            innerRadius={75}
            activeIndex={this.state.activeIndex}
            activeShape={(props: any) => renderActiveShape(props, this.props.nameKey)}
            onMouseEnter={this.onMouseEnter}
          >
            {
              this.props.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))
            }
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }
}

const renderActiveShape = (props: any, nameKey: string) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={-6} textAnchor="middle" fill={fill}>{payload[nameKey]}</text>
      <text x={cx} y={cy} dy={12} textAnchor="middle" fill={fill}>{value}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{payload[nameKey]}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">{(percent * 100).toFixed(2)}%</text>
    </g>
  );
};

const colors = [
  '#8884d8',
  '#83a6ed',
  '#8dd1e1',
  '#82ca9d',
  '#a4de6c',
  '#d0ed57',
  '#1abc9c',
  '#f39c12',
  '#27ae60',
  '#d35400',
  '#3498db',
  '#8e44ad',
  '#2c3e50',
  '#ec87bf',
  '#9ba37e',
  '#b49255',
];

export default CustomPieChart;
