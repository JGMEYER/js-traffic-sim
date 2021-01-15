import { useState } from 'react';

import './App.css';
import { RoadNetwork } from './road/RoadNetwork';
import { GlobalSettingsForm } from './settings/GlobalSettingsForm';

// For now, make sure to update with common.css
const rows = 10;
const cols = 25;

function App() {
  const [globalSettings, setGlobalSettings] = useState({
    displayRoadTileDescriptors: false,
    displayTravelEdges: false,
    displayVehicleColliders: false,
  });

  const setDisplayRoadTileDescriptors = (displayRoadTileDescriptors) => {
    setGlobalSettings({
      ...globalSettings,
      displayRoadTileDescriptors,
    });
  }

  const setDisplayTravelEdges = (displayTravelEdges) => {
    setGlobalSettings({
      ...globalSettings,
      displayTravelEdges,
    });
  }

  const setDisplayVehicleColliders = (displayVehicleColliders) => {
    setGlobalSettings({
      ...globalSettings,
      displayVehicleColliders,
    })
  }

  return (
    <div className="App">
      <RoadNetwork
        globalSettings={globalSettings}
        rows={rows}
        cols={cols} />
      <GlobalSettingsForm
        setDisplayRoadTileDescriptors={setDisplayRoadTileDescriptors}
        setDisplayTravelEdges={setDisplayTravelEdges}
        setDisplayVehicleColliders={setDisplayVehicleColliders}
      />
    </div>
  );
}

export default App;
