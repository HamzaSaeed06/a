import React, { useState } from 'react';
import ChildSwitcher from '../components/ChildSwitcher';
import MapView from '../components/MapView';
import StatusCard from '../components/StatusCard';
import LocationDetails from '../components/LocationDetails';
import SafeZonesCard from '../components/SafeZonesCard';

export default function LiveLocation() {
  const childrenData = [
    {
      id: 'sophia',
      name: 'Sophia Chen',
      age: 8,
      battery: 12,
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=200&h=200&q=80',
      location: {
        address: 'Lincoln Elementary School, 123 Oak St',
        lastUpdated: '2 min ago',
        distance: '349m from you',
      },
      zones: [
        {
          name: 'Home',
          status: 'Outside',
          radius: '150m',
          distance: '895m',
        },
        {
          name: 'Lincoln Elementary',
          status: 'Inside',
          radius: '200m',
          distance: '0m',
        },
      ],
    },
    {
      id: 'liam',
      name: 'Liam Torres',
      age: 10,
      battery: 84,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80',
      location: {
        address: 'Central Sports Complex, 456 Elm St',
        lastUpdated: '1 min ago',
        distance: '1.2km from you',
      },
      zones: [
        {
          name: 'Home',
          status: 'Outside',
          radius: '150m',
          distance: '1.2km',
        },
        {
          name: 'Sports Complex',
          status: 'Inside',
          radius: '250m',
          distance: '0m',
        },
      ],
    },
  ];

  const [selectedChildId, setSelectedChildId] = useState('sophia');
  const currentChild = childrenData.find((c) => c.id === selectedChildId) || childrenData[0];

  return (
    <div className="pb-10">
      {/* Child selector tabs */}
      <ChildSwitcher
        childrenList={childrenData}
        selectedChildId={selectedChildId}
        onSelectChild={setSelectedChildId}
      />

      {/* Main Grid: Map on Left, Status details on Right */}
      <div className="px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Map Card */}
        <div className="lg:col-span-8 flex flex-col">
          <MapView childName={currentChild.name} />
        </div>

        {/* Right Column: 3 Detailed Cards */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <StatusCard child={currentChild} />
          <LocationDetails location={currentChild.location} />
          <SafeZonesCard zones={currentChild.zones} />
        </div>
      </div>
    </div>
  );
}

