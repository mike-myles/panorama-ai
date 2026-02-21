import { PresetTabs } from './PresetTabs';
import { CosmosView } from './CosmosView';

/** App layout: 3D panorama (Cosmos) only. */
export const Dashboard = () => {
  return (
    <div className="min-h-screen w-screen max-w-[100vw] bg-[#0a0a0c] text-white overflow-hidden" style={{ width: '100vw', maxWidth: '100vw' }}>
      <PresetTabs />
      <div className="w-full h-screen overflow-hidden" style={{ paddingTop: '73px' }}>
        <CosmosView />
      </div>
    </div>
  );
};
