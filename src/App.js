import './App.css';
import {TickerApp} from "./components/TickerApp";
import {PriceChartApp} from "./components/PriceChartApp";

function App() {
  return (
    <div className="App">
      <TickerApp/>
      <PriceChartApp/>
    </div>
  );
}

export default App;
