import './App.css';
import { RoadNetwork } from './road/RoadNetwork'

// For now, make sure to update with common.css
const rows = 10;
const cols = 25;

function App() {
  return (
    <div className="App">
      <RoadNetwork rows={rows} cols={cols} />
    </div>
  );
}

export default App;
