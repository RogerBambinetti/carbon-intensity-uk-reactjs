import React, { useState } from 'react';
import { std } from 'mathjs'
import { Chart } from 'react-charts'

import api from '../../services/api';
import './styles.css';

export default function Dashboard() {

  const [data, setData] = useState([]);
  const [period, setPeriod] = useState(1);
  const [initialDate, setInitialDate] = useState('');
  const [averege, setAverege] = useState(0);
  const [standardDeviation, setStandardDeviation] = useState(0);

  function calculateAverage(filteredData) {
    var total = 0;
    for (var i = 0; i < filteredData.length; i++) {
      if (filteredData[i].intensity.actual) {
        total = total + filteredData[i].intensity.actual;
      }
    }
    return (total / filteredData.length).toFixed(2);
  }

  function calculateStandardDeviation(filteredData) {
    try {
      const array = filteredData.map(f => f.intensity.actual & f.intensity.actual);
      return std(array).toFixed(2);
    } catch (e) {
      console.log(e);
    }
  }

  async function getData() {
    var finalDate = new Date(initialDate);
    finalDate.setDate(finalDate.getDate() + 7 * period);
    const stringFinalDate = finalDate.toISOString();
    const response = await api.get(`/intensity/${initialDate}T00:00Z/${stringFinalDate}`);
    return response;
  }

  async function handleLoadData() {
    const response = await getData();
    try {
      const responseData = response.data.data;
      const filteredData = responseData.filter(item => { return item.from.includes('00:00Z') });
      var chartData = [];
      for (var i = 0; i < filteredData.length; i++) {
        chartData.push([filteredData[i].from, filteredData[i].intensity.actual]);
      }
      setData([
        {
          label: 'Intensity',
          data: chartData
        }
      ]);
      setAverege(calculateAverage(filteredData));
      setStandardDeviation(calculateStandardDeviation(filteredData));
    } catch (e) {
      alert('invalid date');
    }
  }

  const axes = [{ primary: true, type: 'ordinal', position: 'bottom' }, { position: 'left', type: 'linear', stacked: false }];

  return (
    <div className="dashboard-container">
      <aside className="menu-container">
        <div className="menu-item">
          <h1>Period</h1>
          <label>Choose the period</label>
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="1">One week</option>
            <option value="2">Two weeks</option>
            <option value="4">One month</option>
          </select>
          <label>Choose the beginning of the period</label>
          <input type="date" max="2020-09-09" value={initialDate} onChange={e => setInitialDate(e.target.value)} />
          <button onClick={handleLoadData}>Load data</button>
        </div>
        <div className="menu-item">
          <h1>Metrics</h1>
          <label>Standard deviation: <b>{standardDeviation}</b></label>
          <label>Average: <b>{averege}</b></label>
        </div>
      </aside>
      <div className="chart-container">
        <div className="chart">
          <Chart data={data} series={{ type: 'bar' }} axes={axes} tooltip />
        </div>
      </div>
    </div>
  );
}
