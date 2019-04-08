import React from 'react';
import StocksList from "./StocksList";

const stocksUrl = 'ws://stocks.mnet.website/';

export default class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      stocks: {},
      connectionError: false
    }
  }


  componentDidMount = () => {
    this.connection = new WebSocket(stocksUrl);
    this.connection.onmessage = this.saveNewStockValues;
    this.connection.onclose = () => { this.setState({connectionError: true}) }
  }

  saveNewStockValues = (event) => {
    let result = JSON.parse(event.data);
    let [up_values_count, down_values_count] = [0, 0];

    let new_stocks = this.state.stocks;
    result.forEach((stock) =>
    {
      if(this.state.stocks[stock[0]])
      {
        new_stocks[stock[0]].current_value > Number(stock[1]) ? up_values_count++ : down_values_count++;

        new_stocks[stock[0]].current_value = Number(stock[1])
        new_stocks[stock[0]].history.push({time: Date.now(), value: Number(stock[1])})
      }
      else
      {
        new_stocks[stock[0]] = { current_value: stock[1], history: [{time: Date.now(), value: Number(stock[1])}], is_selected: false }
      }
    });
    this.setState({stocks: new_stocks});
  }

  newMarketTrend = (up_count, down_count) => {
    if(up_count === down_count) return undefined;
    return up_count > down_count ? 'up' : 'down'
  }

  toggleStockSelection = (stock_name) => {
    let new_stocks = this.state.stocks;
    new_stocks[stock_name].is_selected = !new_stocks[stock_name].is_selected
    this.setState({ stocks: new_stocks })
  }

  areStocksLoaded = () => {
    return Object.keys(this.state.stocks).length > 0;
  }

  render() {
    return (
      <div className='container'>
          <StocksList
            stocks={this.state.stocks}
            toggleStockSelection={this.toggleStockSelection}
            areStocksLoaded={this.areStocksLoaded}
          />
      </div>
    );
  }
}

