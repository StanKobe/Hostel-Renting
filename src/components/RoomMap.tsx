import React from 'react';
import { Room, RoomType } from '../types';
import { motion } from 'motion/react';
import { User, Users, Compass, Gem, Building, Check, Ban, HelpCircle } from 'lucide-react';

interface RoomMapProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  selectedPropertyId: string;
  currentFloor: number;
  setCurrentFloor: (floor: number) => void;
}

export const getRoomTypeIcon = (type: RoomType, className = "w-4 h-4") => {
  switch (type) {
    case 'Single': return <User className={className} />;
    case 'Double': return <Users className={className} />;
    case 'Studio': return <Building className={className} />;
    case 'Suite': return <Gem className={className} />;
  }
};

export default function RoomMap({
  rooms,
  selectedRoomId,
  onSelectRoom,
  selectedPropertyId,
  currentFloor,
  setCurrentFloor
}: RoomMapProps) {
  // Filter rooms belonging to current property and floor
  const filteredRooms = rooms.filter(
    (r) => r.propertyId === selectedPropertyId && r.floor === currentFloor
  );

  // Determine max grid rows and cols to draw the canvas
  const maxRow = Math.max(...filteredRooms.map((r) => r.gridRow), 2);
  const maxCol = Math.max(...filteredRooms.map((r) => r.gridCol), 5);

  // Generate matrix grid indices
  const rows = Array.from({ length: maxRow }, (_, i) => i + 1);
  const cols = Array.from({ length: maxCol + 1 }, (_, i) => i + 1); // Extra col for corridor if needed

  // Find a room at a specific grid coordinate
  const getRoomAt = (row: number, col: number) => {
    // If col is 3, it's reserved as our visual Walkway Corridor
    if (col === 3) return null;
    
    // For cols > 3, we subtract 1 because in generateInitialRooms we skipped col 3 to represent the corridor
    const actualCol = col > 3 ? col - 1 : col;
    return filteredRooms.find((r) => r.gridRow === row && r.gridCol === actualCol);
  };

  const floors = Array.from(new Set(rooms.filter(r => r.propertyId === selectedPropertyId).map(r => r.floor))).sort();

  return (
    <div id="room-map-root" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
      {/* Floor & Heading Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-500" />
            Interactive Floor Map Selector
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Choose your preferred floor and room. Click on any green room to select.
          </p>
        </div>

        {/* Floor Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl self-start sm:self-center border border-slate-100">
          {floors.map((floor) => (
            <button
              key={floor}
              id={`floor-tab-${floor}`}
              onClick={() => setCurrentFloor(floor)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 ${
                currentFloor === floor
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Floor {floor}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 mb-8 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">✓</div>
          <div>
            <span className="font-semibold block">Available</span>
            <span className="text-[10px] text-slate-400">Ready to Book</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 font-bold">👤</div>
          <div>
            <span className="font-semibold block">Occupied</span>
            <span className="text-[10px] text-slate-400">Currently rented</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 font-bold">⏳</div>
          <div>
            <span className="font-semibold block">Reserved</span>
            <span className="text-[10px] text-slate-400">Pending landlord review</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-5 h-5 rounded-md bg-blue-600 border border-blue-700 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
          <div>
            <span className="font-semibold block">Selected</span>
            <span className="text-[10px] text-slate-400">Your choice</span>
          </div>
        </div>
      </div>

      {/* Visual Sitting Map Container */}
      <div className="relative overflow-x-auto pb-4 pt-2">
        <div className="min-w-[620px] max-w-full mx-auto flex flex-col items-center">
          
          {/* Hostel Entrance visual label */}
          <div className="w-full max-w-xl flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] bg-slate-200 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">HOSTEL MAIN STAIRS & ENTRANCE</span>
            <div className="h-[1px] bg-slate-200 flex-1"></div>
          </div>

          {/* Grid Map */}
          <div className="grid gap-3 p-4 bg-slate-50/30 rounded-2xl border border-slate-100 max-w-xl w-full">
            {rows.map((row) => (
              <div key={row} className="flex justify-between items-center gap-2">
                {cols.map((col) => {
                  // If column is 3, draw a visual walkway corredor
                  if (col === 3) {
                    return (
                      <div
                        key={`aisle-${row}`}
                        className="w-12 h-20 flex flex-col items-center justify-center border-l border-r border-dashed border-slate-200 bg-slate-50 text-[9px] font-extrabold text-slate-300 tracking-widest"
                        style={{ writingMode: 'vertical-lr' }}
                      >
                        CORRIDOR
                      </div>
                    );
                  }

                  const room = getRoomAt(row, col);

                  // If no room is mapped at this position, render empty seat block placeholder
                  if (!room) {
                    return (
                      <div
                        key={`empty-${row}-${col}`}
                        className="flex-1 min-w-[70px] h-20 rounded-xl bg-transparent border border-dashed border-slate-100"
                      />
                    );
                  }

                  const isSelected = selectedRoomId === room.id;
                  const isAvailable = room.status === 'Available';
                  const isOccupied = room.status === 'Occupied';
                  const isReserved = room.status === 'Reserved';

                  let bgStyle = "bg-white border-slate-200 hover:border-slate-400 text-slate-700 cursor-pointer shadow-xs";
                  let statusLabel = "Available";
                  
                  if (isOccupied) {
                    bgStyle = "bg-rose-50/80 border-rose-150 text-rose-900 cursor-not-allowed opacity-85";
                    statusLabel = "Rented";
                  } else if (isReserved) {
                    bgStyle = "bg-amber-50/80 border-amber-150 text-amber-950 cursor-not-allowed opacity-85";
                    statusLabel = "Pending";
                  } else if (isSelected) {
                    bgStyle = "bg-blue-600 border-blue-700 text-white shadow-md ring-2 ring-blue-500 ring-offset-2";
                  }

                  return (
                    <motion.button
                      whileHover={isAvailable ? { scale: 1.03, y: -2 } : {}}
                      whileTap={isAvailable ? { scale: 0.98 } : {}}
                      key={room.id}
                      id={`room-button-${room.roomNumber}`}
                      disabled={!isAvailable}
                      onClick={() => onSelectRoom(room.id)}
                      className={`flex-1 min-w-[70px] h-20 rounded-xl border p-2 flex flex-col justify-between transition-all duration-150 text-left relative ${bgStyle}`}
                    >
                      {/* Top row: Room Number & Icon */}
                      <div className="flex justify-between items-start w-full">
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          #{room.roomNumber}
                        </span>
                        <div className={isSelected ? 'text-blue-200' : isOccupied ? 'text-rose-400' : isReserved ? 'text-amber-400' : 'text-slate-400'}>
                          {getRoomTypeIcon(room.type, "w-3.5 h-3.5")}
                        </div>
                      </div>

                      {/* Middle row: Room type name */}
                      <div className="my-0.5">
                        <span className={`text-[10px] font-medium block leading-none ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {room.type}
                        </span>
                      </div>

                      {/* Bottom row: Price or status badge */}
                      <div className="flex justify-between items-end w-full">
                        <span className={`text-xs font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          ${room.price}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm ${
                          isSelected 
                            ? 'bg-blue-700/50 text-blue-100' 
                            : isOccupied 
                              ? 'bg-rose-100/60 text-rose-700' 
                              : isReserved 
                                ? 'bg-amber-100/60 text-amber-700' 
                                : 'bg-emerald-100/60 text-emerald-700'
                        }`}>
                          {isSelected ? 'Your Select' : statusLabel}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Map Footer instructions */}
          <div className="mt-4 flex flex-wrap gap-4 items-center justify-center text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-200"></span>
              <span>Grid gaps represent visual walkways and corridors.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-150 border border-slate-250"></span>
              <span>All suites include a private balcony and attached bath.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
