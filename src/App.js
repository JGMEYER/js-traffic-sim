import { useState } from 'react';

import './App.css';
import { RoadNetwork } from './road/RoadNetwork';
import { GlobalSettingsForm } from './settings/GlobalSettingsForm';

// For now, make sure to update with common.css
const rows = 10;
const cols = 25;

function App() {
  const [globalSettings, setGlobalSettings] = useState({
    displayTravelEdges: false,
  });

  const setDisplayTravelEdges = (displayTravelEdges) => {
    setGlobalSettings({
      ...globalSettings,
      displayTravelEdges,
    });
  }

  return (
    <div className="App">
      <RoadNetwork
        globalSettings={globalSettings}
        rows={rows}
        cols={cols} />
      <GlobalSettingsForm
        setDisplayTravelEdges={setDisplayTravelEdges}
      />
    </div>
  );
}

export default App;
