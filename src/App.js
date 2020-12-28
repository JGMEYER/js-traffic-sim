import './App.css';
import { GridContainer } from './road/Grid.js'
import { TravelGraph } from './road/TravelGraph.js'

// For now, make sure to update with common.css
const rows = 10;
const cols = 25;

function App() {
  return (
    <div className="App">
      <GridContainer rows={rows} cols={cols} />
      <TravelGraph />
    </div>
  );
}

export default App;
