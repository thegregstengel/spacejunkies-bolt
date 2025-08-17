import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Ship {
  id: string;
  classKey: string;
  name: string;
  holds: number;
  shields: number;
  fighters: number;
  torps: number;
  status: 'OK' | 'DISABLED';
}

interface Player {
  id: string;
  credits: number;
  bank: number;
  turns: number;
  currentSectorId: string;
  shipId: string;
  alignment: number;
  faction: 'Federation' | 'Pirate' | 'Neutral';
}

interface Sector {
  id: string;
  region: string;
  name: string;
  hasPort: boolean;
  hasPlanet: boolean;
  connectedSectors: string[];
  players: number;
}

interface GameContextType {
  player: Player | null;
  ship: Ship | null;
  currentSector: Sector | null;
  turns: number;
  credits: number;
  isLoading: boolean;
  initializeGame: () => Promise<void>;
  moveTo: (sectorId: string) => Promise<void>;
  updateCredits: (amount: number) => void;
  updateTurns: (amount: number) => void;
  resetTurns: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [ship, setShip] = useState<Ship | null>(null);
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);
  const [turns, setTurns] = useState(250);
  const [credits, setCredits] = useState(10000);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const gameData = await AsyncStorage.getItem('gameData');
      if (gameData) {
        const data = JSON.parse(gameData);
        setPlayer(data.player);
        setShip(data.ship);
        setCurrentSector(data.currentSector);
        setTurns(data.turns);
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGameData = async (data: any) => {
    try {
      await AsyncStorage.setItem('gameData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  const initializeGame = async () => {
    const initialPlayer: Player = {
      id: 'player_1',
      credits: 10000,
      bank: 0,
      turns: 250,
      currentSectorId: 'sector_1',
      shipId: 'ship_1',
      alignment: 0,
      faction: 'Neutral',
    };

    const initialShip: Ship = {
      id: 'ship_1',
      classKey: 'rustbucket_mk1',
      name: 'My First Ship',
      holds: 50,
      shields: 20,
      fighters: 20,
      torps: 0,
      status: 'OK',
    };

    const initialSector: Sector = {
      id: 'sector_1',
      region: 'FedSpace',
      name: 'Stardock Alpha',
      hasPort: true,
      hasPlanet: false,
      connectedSectors: ['sector_2', 'sector_3'],
      players: 1,
    };

    setPlayer(initialPlayer);
    setShip(initialShip);
    setCurrentSector(initialSector);
    setTurns(250);
    setCredits(10000);

    await saveGameData({
      player: initialPlayer,
      ship: initialShip,
      currentSector: initialSector,
      turns: 250,
      credits: 10000,
    });
  };

  const moveTo = async (sectorId: string) => {
    if (turns <= 0) return;

    // Mock sector data
    const newSector: Sector = {
      id: sectorId,
      region: Math.random() > 0.5 ? 'Inner Belt' : 'Core Ring',
      name: `Sector ${sectorId.split('_')[1]}`,
      hasPort: Math.random() > 0.7,
      hasPlanet: Math.random() > 0.9,
      connectedSectors: [
        `sector_${Math.floor(Math.random() * 100) + 1}`,
        `sector_${Math.floor(Math.random() * 100) + 1}`,
      ],
      players: Math.floor(Math.random() * 3),
    };

    setCurrentSector(newSector);
    updateTurns(-1);

    if (player) {
      const updatedPlayer = { ...player, currentSectorId: sectorId };
      setPlayer(updatedPlayer);
      
      await saveGameData({
        player: updatedPlayer,
        ship,
        currentSector: newSector,
        turns: turns - 1,
        credits,
      });
    }
  };

  const updateCredits = (amount: number) => {
    const newCredits = Math.max(0, credits + amount);
    setCredits(newCredits);
    
    if (player) {
      const updatedPlayer = { ...player, credits: newCredits };
      setPlayer(updatedPlayer);
    }
  };

  const updateTurns = (amount: number) => {
    const newTurns = Math.max(0, turns + amount);
    setTurns(newTurns);
  };

  const resetTurns = () => {
    setTurns(250);
  };

  return (
    <GameContext.Provider value={{
      player,
      ship,
      currentSector,
      turns,
      credits,
      isLoading,
      initializeGame,
      moveTo,
      updateCredits,
      updateTurns,
      resetTurns,
    }}>
      {children}
    </GameContext.Provider>
  );
};