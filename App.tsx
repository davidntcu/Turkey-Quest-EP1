import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RetroWindow, RetroButton, TitleBadge } from './components/RetroUI';
import { VirtualPad } from './components/VirtualPad';
import { generateDinosaur } from './services/geminiService';
import { audioService } from './services/audioService';
import { Language, GameState, Player, Enemy, BattleState, Translation, ShopType, SceneType, DungeonProgress, TileType, SaveData, TownNPC, DungeonTileType, TownTileType } from './types';
import { 
  TRANSLATIONS, 
  INITIAL_PLAYER, 
  GOD_MODE_PLAYER,
  LOCATION_IMAGES, 
  SHOP_IMAGES, 
  LOOT_NAMES,
  MAP_AVONLEA,
  MAP_CAVENDISH,
  MAP_CHARLOTTETOWN,
  TOWN_MAP,
  DUNGEON_B1_MAP,
  DUNGEON_B2_MAP,
  MAP_START_POS,
  TOWN_START_POS,
  DUNGEON_START_POS,
  TILE_COLORS,
  TILE_ICONS,
  ENCOUNTER_RATES,
  PLAYER_SPRITE_URL,
  POTION_ICON_URL,
  GAME_VERSION,
  NPC_DIALOGUES,
  NPC_NAMES
} from './constants';

// Sub-component for cleanliness
const StatusPanel = ({ player, t }: { player: Player, t: Translation }) => {
    // Current Level Max Exp Calculation (approx)
    const nextLevelExp = player.level * 50; 

    // Add Reincarnation count to title strictly
    const displayTitle = `${player.name} ★${player.reincarnationCount}`;

    // Stats calculation (Base + Growth + Equip)
    // Base Atk: 13, Base Def: 5
    const totalAtk = 13 + Math.floor(player.level * 2) + player.equipmentAtk;
    const totalDef = 5 + Math.floor(player.level / 2) + player.equipmentDef;

    return (
    <RetroWindow title={displayTitle} className="h-full bg-blue-900/80 flex flex-col p-2 md:p-4">
        <div className="space-y-1 md:space-y-3 text-sm md:text-2xl font-bold tracking-wide flex-1">
            {/* Improved Level Display Row */}
            <div className="flex items-center gap-2 border-b border-blue-700 pb-1 text-base md:text-lg">
                <span className="text-yellow-400 whitespace-nowrap">{t.lvl} {player.level}</span>
                <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-500 relative">
                        <div 
                            className="bg-purple-500 h-full" 
                            style={{ width: `${Math.min(100, (player.exp / nextLevelExp) * 100)}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-400">{player.exp}/{nextLevelExp}</span>
                </div>
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between text-xs md:text-base text-gray-300">
                    <span>{t.hp}</span>
                    <span>{player.hp.toLocaleString()}/{player.maxHp.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 md:h-3 rounded-full overflow-hidden border border-gray-500">
                    <div className="bg-gradient-to-r from-green-600 to-green-400 h-full" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}></div>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs md:text-base text-gray-300">
                    <span>{t.mp}</span>
                    <span>{player.mp.toLocaleString()}/{player.maxMp.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 md:h-3 rounded-full overflow-hidden border border-gray-500">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full" style={{ width: `${(player.mp / player.maxMp) * 100}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1 md:mt-2 pt-1 md:pt-2 border-t border-blue-700 text-sm md:text-lg">
                <div className="text-red-300">{t.atk}: {totalAtk.toLocaleString()}</div>
                <div className="text-blue-300">{t.def}: {totalDef.toLocaleString()}</div>
            </div>

             {/* Inventory & Equips - Improved Vertical Alignment with Grid */}
             <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-blue-700 space-y-1 text-xs md:text-base hidden md:block">
                <div className="grid grid-cols-[24px_1fr] gap-2 text-orange-300 items-center">
                     <span className="flex justify-center">⚔️</span>
                     <span>{t.atk} +{player.equipmentAtk.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-2 text-gray-300 items-center">
                     <span className="flex justify-center">🛡️</span>
                     <span>{t.def} +{player.equipmentDef.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-2 text-purple-300 items-center">
                     <span className="flex justify-center"><img src={POTION_ICON_URL} alt="Potion" className="w-4 h-4 object-contain" /></span>
                     <span>{t.potions} {player.potions.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-1 md:mt-4 pt-1 md:pt-2 border-t border-blue-700 text-sm md:text-lg text-yellow-200">
                💰 {player.gold.toLocaleString()} G
            </div>
        </div>
    </RetroWindow>
    );
};

export const App = () => {
  // --- State ---
  const [lang, setLang] = useState<Language>(Language.ZH);
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [prevGameState, setPrevGameState] = useState<GameState>(GameState.MAP);
  const [player, setPlayer] = useState<Player>({ ...INITIAL_PLAYER });
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [battleState, setBattleState] = useState<BattleState>(BattleState.PLAYER_INPUT);
  const [menuIndex, setMenuIndex] = useState(0);
  const [titleSelection, setTitleSelection] = useState(0); // 0: Start, 1: Continue
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Name Input State
  const [playerNameInput, setPlayerNameInput] = useState("");
  
  // Save/Load Menu State
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [notification, setNotification] = useState("");
  const [hasSaves, setHasSaves] = useState(false);

  // About Modal State
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Reincarnation Modal State
  const [showReincarnationModal, setShowReincarnationModal] = useState(false);
  const [pendingReincarnationPlayer, setPendingReincarnationPlayer] = useState<Player | null>(null);

  // World Map State
  const [currentScene, setCurrentScene] = useState<SceneType>('AVONLEA');
  const [playerPos, setPlayerPos] = useState({ x: MAP_START_POS.x, y: MAP_START_POS.y });
  const [mapMessage, setMapMessage] = useState<string>("");

  // Town State
  const [townPlayerPos, setTownPlayerPos] = useState({ x: TOWN_START_POS.x, y: TOWN_START_POS.y });
  const [activeShop, setActiveShop] = useState<ShopType>(null);
  const [townMessage, setTownMessage] = useState<string>("");
  const [townNPCs, setTownNPCs] = useState<TownNPC[]>([]);

  // Dungeon State
  const [dungeonFloor, setDungeonFloor] = useState<number>(1);
  const [dungeonPlayerPos, setDungeonPlayerPos] = useState({ x: DUNGEON_START_POS.x, y: DUNGEON_START_POS.y });
  const [dungeonProgress, setDungeonProgress] = useState<DungeonProgress>({ 
      avonlea: { b1: false, b2: false },
      cavendish: { b1: false, b2: false },
      charlottetown: { b1: false, b2: false }
  });
  const [selectedLocation, setSelectedLocation] = useState<keyof typeof LOCATION_IMAGES | null>(null);
  const [exploreLog, setExploreLog] = useState<string>("");
  
  // Input Lock Cooldown
  const [inputCooldown, setInputCooldown] = useState(false);

  // Passive Effects Timer (Academy)
  const academyTimer = useRef<number>(0);

  // Helpers
  const t = TRANSLATIONS[lang];
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const getCurrentMapData = () => {
    if (currentScene === 'CHARLOTTETOWN') return MAP_CHARLOTTETOWN;
    if (currentScene === 'CAVENDISH') return MAP_CAVENDISH;
    return MAP_AVONLEA;
  };

  const getDungeonMap = () => {
      return dungeonFloor === 1 ? DUNGEON_B1_MAP : DUNGEON_B2_MAP;
  }

  // Initialize Audio on first interaction
  const handleUserInteraction = () => {
    if (gameState === GameState.BATTLE && (battleState === BattleState.VICTORY || battleState === BattleState.DEFEAT)) {
        handleInput('ENTER');
    }
    audioService.init().catch(console.error);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioService.init().catch(console.error);
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) audioService.playSfx('SELECT');
  };

  // Check for saves on mount
  const checkSaves = () => {
    const slots = [];
    for(let i=1; i<=5; i++) {
          const data = localStorage.getItem(`turkey_quest_save_${i}`);
          slots.push(data);
    }
    if (slots.some(s => s !== null)) {
        setHasSaves(true);
    }
  };

  useEffect(() => {
    checkSaves();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [battleLogs]);

  useEffect(() => {
    if (gameState === GameState.TITLE || gameState === GameState.NAME_INPUT) {
        audioService.playBgm('TITLE');
    } else if (gameState === GameState.MAP || gameState === GameState.TOWN) {
        audioService.playBgm('MAP');
    } else if (gameState === GameState.BATTLE || gameState === GameState.DUNGEON) {
        audioService.playBgm('BATTLE');
    } else {
        audioService.stopBgm();
    }
  }, [gameState]);

  // Town NPC Init & Movement
  const initTownNPCs = useCallback(() => {
    const newNPCs: TownNPC[] = [];
    const seedBase = Date.now();
    const npcCount = 5; 
    const rewardIndex = Math.floor(Math.random() * npcCount); 

    for (let i = 0; i < npcCount; i++) {
       let rx = 0, ry = 0;
       do {
           rx = Math.floor(Math.random() * TOWN_MAP[0].length);
           ry = Math.floor(Math.random() * TOWN_MAP.length);
       } while (TOWN_MAP[ry][rx] !== 'R');

       const dialogueList = NPC_DIALOGUES;
       const dialogue = dialogueList[Math.floor(Math.random() * dialogueList.length)];
       const name = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];

       let reward = undefined;
       if (i === rewardIndex) {
           const roll = Math.random();
           if (roll < 0.4) reward = { type: 'GOLD', value: Math.floor(Math.random() * 50) + 50 }; 
           else if (roll < 0.7) reward = { type: 'POTION', value: 1 }; 
           else if (roll < 0.85) reward = { type: 'MAXHP', value: 1 };
           else reward = { type: 'MAXMP', value: 1 }; 
       }

       newNPCs.push({
           id: i,
           x: rx,
           y: ry,
           avatarSeed: `NPC_${seedBase}_${i}`,
           name,
           dialogue,
           reward: reward as any,
           rewardClaimed: false
       });
    }
    setTownNPCs(newNPCs);
  }, [currentScene]);

  // NPC Movement Loop
  useEffect(() => {
      if (gameState !== GameState.TOWN || activeShop) return;

      const interval = setInterval(() => {
          setTownNPCs(prev => prev.map(npc => {
              if (Math.random() > 0.6) return npc; 

              const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
              const move = dirs[Math.floor(Math.random() * dirs.length)];
              const nx = npc.x + move[0];
              const ny = npc.y + move[1];

              if (ny >= 0 && ny < TOWN_MAP.length && nx >= 0 && nx < TOWN_MAP[0].length) {
                  if (TOWN_MAP[ny][nx] === 'R') {
                      return { ...npc, x: nx, y: ny };
                  }
              }
              return npc;
          }));
      }, 1500);

      return () => clearInterval(interval);
  }, [gameState, activeShop]);


  // Passive Effects Timer
  useEffect(() => {
    if (gameState !== GameState.MAP) {
        academyTimer.current = 0; 
        return;
    }

    const interval = setInterval(() => {
        const mapData = getCurrentMapData();
        const tile = mapData[playerPos.y][playerPos.x];
        let effected = false;

        if (tile === 'H' && (player.hp < player.maxHp || player.mp < player.maxMp)) {
             setPlayer((p: Player) => ({
                 ...p,
                 hp: Math.min(p.maxHp, p.hp + 1),
                 mp: Math.min(p.maxMp, p.mp + 1)
             }));
             effected = true;
        }

        if (tile === 'K') {
            setPlayer((p: Player) => ({ ...p, gold: p.gold + 10 }));
            effected = true;
        }

        if (tile === 'U') {
            academyTimer.current += 1;
            if (academyTimer.current >= 5) {
                setPlayer((p: Player) => ({ ...p, potions: p.potions + 1 }));
                academyTimer.current = 0;
                effected = true;
            }
        } else {
            academyTimer.current = 0;
        }
        
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, playerPos, player, currentScene]);

  // --- Naming Logic ---
  
  const getVisualLength = (str: string) => {
      let len = 0;
      for (let i = 0; i < str.length; i++) {
          if (str.charCodeAt(i) > 255) len += 2;
          else len += 1;
      }
      return len;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      if (getVisualLength(newVal) <= 10) {
          setPlayerNameInput(newVal);
      }
  };

  const submitName = () => {
      audioService.playSfx('CONFIRM');
      const finalName = playerNameInput.trim() || t.naming.defaultName;
      setPlayer({ ...INITIAL_PLAYER, name: finalName });
      setGameState(GameState.MAP);
      setCurrentScene('AVONLEA');
      setPlayerPos(MAP_START_POS); // Reset Position to Start
      setDungeonFloor(1);
      setDungeonProgress({ 
          avonlea: { b1: false, b2: false },
          cavendish: { b1: false, b2: false },
          charlottetown: { b1: false, b2: false }
      });
      setMapMessage(t.dungeon.title);
  };

  // --- Save/Load Logic ---

  const getSaveSlots = (): (SaveData | null)[] => {
      const slots: (SaveData | null)[] = [];
      for(let i=1; i<=5; i++) {
          const data = localStorage.getItem(`turkey_quest_save_${i}`);
          slots.push(data ? JSON.parse(data) : null);
      }
      return slots;
  };

  const createSaveData = (overridePlayer?: Player): SaveData => {
      const locationLabel = gameState === GameState.DUNGEON 
        ? `${t.dungeon.floor(dungeonFloor)}` 
        : (gameState === GameState.TOWN ? t.town.welcome.split(' ')[2] || 'Town' : (currentScene === 'AVONLEA' ? t.scenes.avonlea : (currentScene === 'CAVENDISH' ? t.scenes.cavendish : t.scenes.charlottetown)));

      return {
          player: overridePlayer || player,
          currentScene,
          playerPos,
          townPlayerPos,
          dungeonFloor,
          dungeonPlayerPos,
          dungeonProgress,
          timestamp: Date.now(),
          locationLabel
      };
  };

  const performSave = (slotIndex: number, data: SaveData) => {
      localStorage.setItem(`turkey_quest_save_${slotIndex + 1}`, JSON.stringify(data));
      setHasSaves(true);
  };

  const saveGame = (slotIndex: number) => {
      performSave(slotIndex, createSaveData());
      audioService.playSfx('WIN');
      setSaveMessage(t.saveLoad.savedMsg);
      setTimeout(() => {
          setSaveMessage("");
          setShowSaveMenu(false);
      }, 1000);
  };

  const autoSaveGame = (currentPlayerState: Player) => {
      const data = createSaveData(currentPlayerState);
      performSave(4, data);
      addLog(t.saveLoad.autoSavedLog);
  };

  const loadGame = (slotIndex: number) => {
      const dataStr = localStorage.getItem(`turkey_quest_save_${slotIndex + 1}`);
      if (!dataStr) return;
      
      const data: SaveData = JSON.parse(dataStr);
      setPlayer(data.player);
      setCurrentScene(data.currentScene);
      setPlayerPos(data.playerPos);
      setTownPlayerPos(data.townPlayerPos);
      setDungeonFloor(data.dungeonFloor);
      setDungeonPlayerPos(data.dungeonPlayerPos || DUNGEON_START_POS);
      if (!data.dungeonProgress.avonlea) {
          setDungeonProgress({ 
              avonlea: { b1: false, b2: false },
              cavendish: { b1: false, b2: false },
              charlottetown: { b1: false, b2: false }
          });
      } else {
          setDungeonProgress(data.dungeonProgress);
      }
      
      if (data.dungeonFloor > 0 && data.locationLabel.includes('B')) {
          setGameState(GameState.DUNGEON); 
      } else if (data.locationLabel.includes('Town') || data.locationLabel.includes('堡壘')) {
          setGameState(GameState.TOWN);
      } else {
          setGameState(GameState.MAP);
      }

      setMapMessage(t.saveLoad.loadedMsg);
      audioService.playSfx('CONFIRM');
      setShowLoadMenu(false);
  };

  const handleReturnToTitle = (e: React.MouseEvent) => {
      e.stopPropagation();
      audioService.playSfx('SELECT');
      autoSaveGame(player);
      setNotification(t.saveLoad.returningMsg);
      setTimeout(() => {
          setNotification("");
          setGameState(GameState.TITLE);
          checkSaves();
      }, 1500);
  };

  // --- Logic ---

  const addLog = (msg: string) => {
    setBattleLogs(prev => [...prev.slice(-4), msg]);
  };

  const getDist = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
      return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  };

  const findTileLocation = (mapData: TileType[][], tileChar: TileType) => {
      for(let y=0; y<mapData.length; y++) {
          for(let x=0; x<mapData[0].length; x++) {
              if (mapData[y][x] === tileChar) return {x, y};
          }
      }
      return null;
  };

  const calculateEncounterLevel = (isBoss: boolean, mapData: TileType[][], currentPos: {x:number, y:number}) => {
    let sceneMin = 1;
    let sceneMax = 8;
    
    let additive = 0;
    if (currentScene === 'CAVENDISH') additive = 5;
    if (currentScene === 'CHARLOTTETOWN') additive = 10;

    sceneMin += additive;
    sceneMax += additive;

    if (gameState === GameState.DUNGEON) {
        if (dungeonFloor === 1) { return Math.floor(Math.random() * ((9 + additive) - (5 + additive) + 1)) + (5 + additive); } 
        if (dungeonFloor === 2) { return Math.floor(Math.random() * ((10 + additive) - (8 + additive) + 1)) + (8 + additive); } 
        
        if (isBoss) {
            const baseBossLvl = dungeonFloor === 1 ? 10 : 15;
            return baseBossLvl + additive;
        }
    } 

    const totalRange = sceneMax - sceneMin;
    const oneThird = totalRange / 3;
    
    const lowEndMax = Math.floor(sceneMin + oneThird);
    const highEndMin = Math.ceil(sceneMin + (oneThird * 2));

    const townLoc = findTileLocation(mapData, 'C');
    if (townLoc && getDist(currentPos, townLoc) <= 5) {
        return Math.floor(Math.random() * (lowEndMax - sceneMin + 1)) + sceneMin;
    }

    const dungeonLocV = findTileLocation(mapData, 'V');
    if (dungeonLocV && getDist(currentPos, dungeonLocV) <= 3) {
         return Math.floor(Math.random() * (sceneMax - highEndMin + 1)) + highEndMin;
    }

    const midMin = lowEndMax + 1;
    const midMax = highEndMin - 1;
    
    if (midMin > midMax) return Math.floor(sceneMin + (totalRange/2)); 
    return Math.floor(Math.random() * (midMax - midMin + 1)) + midMin;
  };

  const startBattle = async (isBoss = false) => {
    setEnemy(null);
    
    audioService.playSfx(isBoss ? 'LOSE' : 'CONFIRM'); 
    setLoading(true);
    const mapData = getCurrentMapData();
    let currentTile: TileType = 'G'; 
    
    if (gameState === GameState.MAP) {
         currentTile = mapData[playerPos.y][playerPos.x];
    }

    setPrevGameState(gameState);
    setGameState(GameState.BATTLE);
    setBattleState(BattleState.PLAYER_INPUT);
    setBattleLogs([]);
    setMenuIndex(0);

    if (gameState === GameState.DUNGEON) setSelectedLocation('volcano');
    else if (currentTile === 'F') setSelectedLocation('forest');
    else if (currentTile === 'M') setSelectedLocation('mountain');
    else if (currentTile === 'C') setSelectedLocation('castle');
    else setSelectedLocation('castle');

    const targetLevel = calculateEncounterLevel(isBoss, mapData, playerPos);

    const newEnemy = await generateDinosaur(targetLevel, lang);
    
    if (isBoss) {
        newEnemy.isBoss = true;
        newEnemy.name = `BOSS: ${newEnemy.name}`;
        newEnemy.hp = Math.floor(newEnemy.hp * 1.5);
        newEnemy.attack = Math.floor(newEnemy.attack * 1.2);
    }
    
    setEnemy(newEnemy);
    addLog(t.enemyAppears(newEnemy.name));
    setLoading(false);
  };

  const checkRandomEncounter = (tile: TileType | DungeonTileType) => {
    if (['C', 'V', 'H', 'K', 'U', 'W', '_', 'S', 'E', 'B', 'g', 'w', 'a', 'i', 'm', 'N', 'd'].includes(tile)) return false; 

    // Handle undefined rate from TS error
    const rate = ENCOUNTER_RATES[tile as TileType | DungeonTileType] || 0.1;
    let finalRate = rate;
    
    if (gameState === GameState.DUNGEON) finalRate = 0.35;

    if (Math.random() < finalRate) {
       setMapMessage(t.dungeon.encounter);
       setTimeout(() => startBattle(false), 100);
       return true;
    }
    return false;
  };

  const handlePlayerAction = async (action: 'PHYSICAL' | 'MAG_ATK' | 'MAG_HEAL' | 'ITEM' | 'FLEE') => {
    if (!enemy || battleState !== BattleState.PLAYER_INPUT || loading) return;

    setBattleState(BattleState.PROCESSING);
    audioService.playSfx('SELECT');
    
    let playerDamage = 0;

    switch (action) {
      case 'PHYSICAL':
        playerDamage = Math.max(1, Math.floor(Math.random() * 5) + (13 + player.level * 2 + player.equipmentAtk) - enemy.defense);
        if (Math.random() > 0.9) playerDamage = Math.floor(playerDamage * 1.5);
        
        audioService.playSfx('ATTACK');
        setTimeout(() => audioService.playSfx('HIT'), 200);

        setEnemy((prev: Enemy | null) => prev ? { ...prev, hp: Math.max(0, prev.hp - playerDamage) } : null);
        addLog(t.playerAttack(playerDamage));
        break;

      case 'MAG_ATK':
        if (player.mp >= 5) {
            playerDamage = Math.floor(Math.random() * 10) + player.level * 4 + 10;
            audioService.playSfx('CONFIRM'); 
            setTimeout(() => audioService.playSfx('HIT'), 300);

            setPlayer((prev: Player) => ({ ...prev, mp: prev.mp - 5 }));
            setEnemy((prev: Enemy | null) => prev ? { ...prev, hp: Math.max(0, prev.hp - playerDamage) } : null);
            addLog(t.playerMagAtk(playerDamage));
        } else {
            audioService.playSfx('CANCEL');
            addLog(t.noMp);
            setBattleState(BattleState.PLAYER_INPUT);
            return;
        }
        break;

      case 'MAG_HEAL':
        if (player.mp >= 3) {
          const healAmount = 20 + player.level * 5;
          audioService.playSfx('HEAL');
          setPlayer((prev: Player) => ({ 
            ...prev, 
            mp: prev.mp - 3, 
            hp: Math.min(prev.maxHp, prev.hp + healAmount) 
          }));
          addLog(t.heal(healAmount));
        } else {
          audioService.playSfx('CANCEL');
          addLog(t.noMp);
          setBattleState(BattleState.PLAYER_INPUT); 
          return;
        }
        break;
        
      case 'ITEM':
         if (player.potions > 0) {
            audioService.playSfx('HEAL');
            setPlayer((prev: Player) => ({ 
                ...prev, 
                potions: prev.potions - 1, 
                hp: Math.min(prev.maxHp, prev.hp + 40) 
            }));
            addLog(t.itemUsed());
         } else {
             audioService.playSfx('CANCEL');
             addLog(t.noItem);
             setBattleState(BattleState.PLAYER_INPUT);
             return;
         }
         break;

      case 'FLEE':
        if (enemy.isBoss) {
            audioService.playSfx('CANCEL');
            addLog(t.runFail); 
        } else if (Math.random() > 0.4) {
          audioService.playSfx('CONFIRM');
          addLog(t.runSuccess);
          await new Promise(r => setTimeout(r, 1000));
          setGameState(prevGameState);
          setInputCooldown(true);
          setTimeout(() => setInputCooldown(false), 500);
          return;
        } else {
          audioService.playSfx('CANCEL');
          addLog(t.runFail);
        }
        break;
    }

    if (enemy.hp - playerDamage <= 0 && (action === 'PHYSICAL' || action === 'MAG_ATK')) {
      const expGain = enemy.maxHp * 2;
      const goldGain = enemy.attack * 5;
      
      const lootRoll = Math.random();
      let lootMsg = "";
      
      let newPlayer = { ...player };
      if (action === 'MAG_ATK') newPlayer.mp -= 5; 

      newPlayer.exp += expGain;
      newPlayer.gold += goldGain;
      
      let leveledUp = false;
      let nextLevelCost = newPlayer.level * 50;

      while (newPlayer.exp >= nextLevelCost) {
          newPlayer.exp -= nextLevelCost; 
          newPlayer.level += 1;
          newPlayer.maxHp += 10;
          newPlayer.maxMp += 5;
          newPlayer.hp = newPlayer.maxHp; 
          newPlayer.mp = newPlayer.maxMp;
          
          nextLevelCost = newPlayer.level * 50;
          leveledUp = true;
      }

      if (lootRoll > 0.90) { 
         const grimoires = LOOT_NAMES[lang].grimoires;
         const gName = grimoires[Math.floor(Math.random() * grimoires.length)];
         const boost = 5;
         newPlayer.maxMp += boost;
         newPlayer.mp = newPlayer.maxMp;
         lootMsg = `${t.loot.found(gName)} ${t.loot.learn("Max MP", boost)}`;
      } else if (lootRoll > 0.75) { 
         if (Math.random() > 0.5) {
             const weapons = LOOT_NAMES[lang].weapons;
             const wName = weapons[Math.floor(Math.random() * weapons.length)];
             const boost = Math.floor(Math.random() * 3) + 1;
             newPlayer.equipmentAtk += boost;
             lootMsg = `${t.loot.found(wName)} ${t.loot.equip(t.atk, boost)}`;
         } else {
             const armors = LOOT_NAMES[lang].armors;
             const aName = armors[Math.floor(Math.random() * armors.length)];
             const boost = Math.floor(Math.random() * 3) + 1;
             newPlayer.equipmentDef += boost;
             lootMsg = `${t.loot.found(aName)} ${t.loot.equip(t.def, boost)}`;
         }
      } else if (lootRoll > 0.40) { 
          newPlayer.potions += 1;
          lootMsg = t.loot.found(t.potions);
      }

      if (enemy.isBoss) {
          addLog(t.dungeon.floorCleared);
          
          const progressUpdate = {...dungeonProgress};
          let triggerReincarnation = false;

          if (currentScene === 'AVONLEA') {
              if (dungeonFloor === 1) progressUpdate.avonlea.b1 = true;
              if (dungeonFloor === 2) progressUpdate.avonlea.b2 = true;
          } else if (currentScene === 'CAVENDISH') {
              if (dungeonFloor === 1) progressUpdate.cavendish.b1 = true;
              if (dungeonFloor === 2) progressUpdate.cavendish.b2 = true;
          } else if (currentScene === 'CHARLOTTETOWN') {
              if (dungeonFloor === 1) progressUpdate.charlottetown.b1 = true;
              if (dungeonFloor === 2) {
                  progressUpdate.charlottetown.b2 = true;
                  triggerReincarnation = true;
              }
          }
          
          setDungeonProgress(progressUpdate);

          let unlocked = false;
          if (currentScene === 'AVONLEA' && progressUpdate.avonlea.b2) unlocked = true;
          if (currentScene === 'CAVENDISH' && progressUpdate.cavendish.b2) unlocked = true;
          
          if (unlocked) {
              addLog(t.dungeon.sceneUnlocked);
              setTimeout(() => audioService.playSfx('WIN'), 800);
          }

          if (triggerReincarnation) {
             const nextCount = newPlayer.reincarnationCount + 1;
             newPlayer.reincarnationCount = nextCount;
             newPlayer.equipmentAtk += 10;
             newPlayer.equipmentDef += 10;
             
             setPendingReincarnationPlayer(newPlayer);
             setPlayer(newPlayer); 
             setShowReincarnationModal(true);
             
             if (leveledUp) {
                addLog(`Level Up! You are now level ${newPlayer.level}!`);
                setTimeout(() => audioService.playSfx('WIN'), 500);
            } else {
                audioService.playSfx('WIN');
            }
            addLog(t.win(expGain, goldGain));
            if (lootMsg) addLog(lootMsg);
            
            setBattleState(BattleState.VICTORY);
            return;
          }
      }

      setPlayer(newPlayer); 
      
      if (leveledUp) {
          addLog(`Level Up! You are now level ${newPlayer.level}!`);
          setTimeout(() => audioService.playSfx('WIN'), 500);
      } else {
          audioService.playSfx('WIN');
      }

      addLog(t.win(expGain, goldGain));
      if (lootMsg) addLog(lootMsg);

      setBattleState(BattleState.VICTORY);
      
      autoSaveGame(newPlayer);

      return; 
    }

    await new Promise(r => setTimeout(r, 1000));

    if (enemy.hp > 0) {
      const playerDef = 5 + Math.floor(player.level / 2) + player.equipmentDef;
      const enemyDmg = Math.max(1, enemy.attack - playerDef);
      
      audioService.playSfx('ATTACK');
      setTimeout(() => audioService.playSfx('HIT'), 200);
      
      setPlayer((prev: Player) => ({ ...prev, hp: Math.max(0, prev.hp - enemyDmg) }));
      addLog(t.enemyAttack(enemy.name, enemyDmg));

      if (player.hp - enemyDmg <= 0) {
        audioService.playSfx('LOSE');
        addLog(t.lose);
        setBattleState(BattleState.DEFEAT);
      } else {
        setBattleState(BattleState.PLAYER_INPUT);
      }
    }
  };

  const confirmReincarnation = () => {
    if (!pendingReincarnationPlayer) return;

    audioService.playSfx('WIN');
    
    setPlayer(pendingReincarnationPlayer);

    const resetProgress = {
       avonlea: { b1: false, b2: false },
       cavendish: { b1: false, b2: false },
       charlottetown: { b1: false, b2: false }
    };
    setDungeonProgress(resetProgress);
    
    setCurrentScene('AVONLEA');
    setGameState(GameState.MAP);
    setPlayerPos(MAP_START_POS);
    
    autoSaveGame(pendingReincarnationPlayer);
    
    setShowReincarnationModal(false);
    setPendingReincarnationPlayer(null);
  };

  const handleShopTransaction = (choice: number) => {
    if (choice === 1) {
        setActiveShop(null);
        setTownMessage("");
        return;
    }

    const costRest = 20;
    const costWeapon = 100 * player.level;
    const costArmor = 100 * player.level;
    const costPotion = 20;
    const costMagic = 200 * player.level;

    let success = false;

    if (activeShop === 'GUILD') {
        if (player.gold >= costRest) {
            setPlayer((p: Player) => ({...p, gold: p.gold - costRest, hp: p.maxHp, mp: p.maxMp}));
            setTownMessage(t.town.restored);
            success = true;
        }
    } else if (activeShop === 'WEAPON') {
        if (player.gold >= costWeapon) {
            setPlayer((p: Player) => ({...p, gold: p.gold - costWeapon, equipmentAtk: p.equipmentAtk + 3}));
            setTownMessage(t.town.bought);
            success = true;
        }
    } else if (activeShop === 'ARMOR') {
        if (player.gold >= costArmor) {
            setPlayer((p: Player) => ({...p, gold: p.gold - costArmor, equipmentDef: p.equipmentDef + 3}));
            setTownMessage(t.town.bought);
            success = true;
        }
    } else if (activeShop === 'ITEM') {
        if (player.gold >= costPotion) {
            setPlayer((p: Player) => ({...p, gold: p.gold - costPotion, potions: p.potions + 1}));
            setTownMessage(t.town.bought);
            success = true;
        }
    } else if (activeShop === 'MAGIC') {
        if (player.gold >= costMagic) {
            setPlayer((p: Player) => ({...p, gold: p.gold - costMagic, maxMp: p.maxMp + 5, mp: p.mp + 5}));
            setTownMessage(t.town.bought);
            success = true;
        }
    }

    if (success) audioService.playSfx('HEAL'); 
    else {
        setTownMessage(t.town.notEnoughGold);
        audioService.playSfx('CANCEL');
    }
  };

  const switchScene = (target: SceneType) => {
      audioService.playSfx('CONFIRM');
      setCurrentScene(target);
      setPlayerPos(MAP_START_POS);
      const targetName = target === 'AVONLEA' ? t.scenes.avonlea : (target === 'CAVENDISH' ? t.scenes.cavendish : t.scenes.charlottetown);
      setMapMessage(t.scenes.travelTo(targetName));
  };

  const handleInput = useCallback((key: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ENTER') => {
    if (loading || showSaveMenu || showLoadMenu || notification || inputCooldown || showReincarnationModal || showAboutModal) return;

    if (gameState === GameState.NAME_INPUT) {
        if (key === 'ENTER') submitName();
        return;
    }

    if (gameState !== GameState.MAP && gameState !== GameState.TOWN && gameState !== GameState.DUNGEON && (key === 'UP' || key === 'DOWN')) audioService.playSfx('SELECT');

    if (gameState === GameState.TITLE) {
      if (key === 'UP' || key === 'DOWN') {
          setTitleSelection(prev => prev === 0 ? 1 : 0);
          audioService.playSfx('SELECT');
      }
      if (key === 'ENTER') {
         audioService.playSfx('CONFIRM');
         if (titleSelection === 0) {
            setPlayerNameInput("");
            setGameState(GameState.NAME_INPUT);
         } else {
             if (hasSaves) {
                setShowLoadMenu(true);
             } else {
                 audioService.playSfx('CANCEL');
             }
         }
      }
    } 
    else if (gameState === GameState.MAP) {
      const MAP_DATA = getCurrentMapData();
      
      if (key === 'ENTER') {
          const tile = MAP_DATA[playerPos.y][playerPos.x];
          
          if (tile === 'C') {
              audioService.playSfx('CONFIRM');
              setSelectedLocation('castle');
              setGameState(GameState.TOWN);
              setTownMessage(t.town.welcome);
              setTownPlayerPos(TOWN_START_POS); 
              setActiveShop(null);
              initTownNPCs(); 
          } else if (tile === 'V') {
              audioService.playSfx('CONFIRM');
              setSelectedLocation('volcano');
              setGameState(GameState.DUNGEON);
              setDungeonFloor(1); 
              setDungeonPlayerPos(DUNGEON_START_POS);
              setExploreLog(t.dungeon.floor(1));
              setMenuIndex(0);
          } else if (tile === 'H') {
              audioService.playSfx('HEAL');
              setMapMessage(t.facilityHints.house);
          } else if (tile === 'K') {
              audioService.playSfx('CONFIRM');
              setMapMessage(t.facilityHints.school);
          } else if (tile === 'U') {
              audioService.playSfx('CONFIRM');
              setMapMessage(t.facilityHints.academy);
          } else {
              setMapMessage(t.dungeon.nothing);
          }
          return;
      }

      let dx = 0;
      let dy = 0;
      if (key === 'UP') dy = -1;
      if (key === 'DOWN') dy = 1;
      if (key === 'LEFT') dx = -1;
      if (key === 'RIGHT') dx = 1;

      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;

      if (newY >= 0 && newY < MAP_DATA.length && newX >= 0 && newX < MAP_DATA[0].length) {
          const targetTile = MAP_DATA[newY][newX];
          if (targetTile !== 'W') {
              setPlayerPos({ x: newX, y: newY });
              audioService.playSfx('SELECT');
              
              if (targetTile === 'C') setMapMessage(t.mapActions.enterTown);
              else if (targetTile === 'V') setMapMessage(t.mapActions.enterDungeon);
              else if (targetTile === 'H') setMapMessage(t.facilityHints.house);
              else if (targetTile === 'K') setMapMessage(t.facilityHints.school);
              else if (targetTile === 'U') setMapMessage(t.facilityHints.academy);
              else setMapMessage("");

              if (targetTile !== 'C' && targetTile !== 'V' && targetTile !== 'H' && targetTile !== 'K' && targetTile !== 'U') {
                  checkRandomEncounter(targetTile);
              }
          }
      }
    }
    else if (gameState === GameState.TOWN) {
        if (activeShop) {
            if (key === 'UP') setMenuIndex(prev => (prev - 1 + 2) % 2);
            if (key === 'DOWN') setMenuIndex(prev => (prev + 1) % 2);
            if (key === 'ENTER') handleShopTransaction(menuIndex);
        } else {
            if (key === 'ENTER') {
                const tile = TOWN_MAP[townPlayerPos.y][townPlayerPos.x];
                
                if (tile === 'E') {
                    audioService.playSfx('CANCEL');
                    setGameState(GameState.MAP);
                    return;
                }

                const npc = townNPCs.find(n => getDist({x: n.x, y: n.y}, townPlayerPos) <= 1);
                
                if (npc) {
                    audioService.playSfx('CONFIRM');
                    let msg = `[${npc.name}]: ${npc.dialogue}`;
                    
                    if (npc.reward && !npc.rewardClaimed) {
                        const r = npc.reward;
                        if (r.type === 'GOLD') {
                            setPlayer((p: Player) => ({...p, gold: p.gold + r.value}));
                            msg += ` (獲得 ${r.value} 金幣)`;
                        } else if (r.type === 'POTION') {
                            setPlayer((p: Player) => ({...p, potions: p.potions + r.value}));
                            msg += ` (獲得 ${r.value} 藥水)`;
                        } else if (r.type === 'MAXHP') {
                            setPlayer((p: Player) => ({...p, maxHp: p.maxHp + r.value, hp: p.hp + r.value}));
                            msg += ` (生命上限 +${r.value})`;
                        } else if (r.type === 'MAXMP') {
                            setPlayer((p: Player) => ({...p, maxMp: p.maxMp + r.value, mp: p.mp + r.value}));
                            msg += ` (魔力上限 +${r.value})`;
                        }
                        audioService.playSfx('WIN'); 
                        setTownNPCs(prev => prev.map(n => n.id === npc.id ? {...n, rewardClaimed: true} : n));
                    }
                    setTownMessage(msg);
                    return; 
                }

                let shop: ShopType = null;
                if (tile === 'g') shop = 'GUILD';
                else if (tile === 'w') shop = 'WEAPON';
                else if (tile === 'a') shop = 'ARMOR';
                else if (tile === 'i') shop = 'ITEM';
                else if (tile === 'm') shop = 'MAGIC';

                if (shop) {
                    audioService.playSfx('CONFIRM');
                    setActiveShop(shop);
                    setTownMessage("");
                    setMenuIndex(0);
                }
                return;
            }

            let dx = 0;
            let dy = 0;
            if (key === 'UP') dy = -1;
            if (key === 'DOWN') dy = 1;
            if (key === 'LEFT') dx = -1;
            if (key === 'RIGHT') dx = 1;

            const newX = townPlayerPos.x + dx;
            const newY = townPlayerPos.y + dy;

            if (newY >= 0 && newY < TOWN_MAP.length && newX >= 0 && newX < TOWN_MAP[0].length) {
                const targetTile = TOWN_MAP[newY][newX];
                if (targetTile !== 'T' && targetTile !== 'N' && targetTile !== '_') {
                    setTownPlayerPos({ x: newX, y: newY });
                    audioService.playSfx('SELECT');
                    
                    let msg = "";
                    if (targetTile === 'g') msg = t.town.shops.guild;
                    if (targetTile === 'w') msg = t.town.shops.weapon;
                    if (targetTile === 'a') msg = t.town.shops.armor;
                    if (targetTile === 'i') msg = t.town.shops.item;
                    if (targetTile === 'm') msg = t.town.shops.magic;
                    if (targetTile === 'E') msg = t.town.exitTown;
                    if (msg) setTownMessage(t.town.enterShop); 
                }
            }
        }
    }
    else if (gameState === GameState.DUNGEON) {
        const dMap = getDungeonMap();
        
        if (key === 'ENTER') {
            const tile = dMap[dungeonPlayerPos.y][dungeonPlayerPos.x];
            
            let cleared = false;
            if (currentScene === 'AVONLEA') {
                cleared = dungeonFloor === 1 ? dungeonProgress.avonlea.b1 : dungeonProgress.avonlea.b2;
            } else if (currentScene === 'CAVENDISH') {
                cleared = dungeonFloor === 1 ? dungeonProgress.cavendish.b1 : dungeonProgress.cavendish.b2;
            } else if (currentScene === 'CHARLOTTETOWN') {
                cleared = dungeonFloor === 1 ? dungeonProgress.charlottetown.b1 : dungeonProgress.charlottetown.b2;
            }

            if (tile === 'E') {
                audioService.playSfx('CONFIRM');
                setGameState(GameState.MAP);
                setExploreLog("");
            } else if (tile === 'S') {
                audioService.playSfx('CONFIRM');
                if (dungeonFloor === 1) {
                    setDungeonFloor(2);
                    setDungeonPlayerPos({x: 12, y: 1}); 
                    setExploreLog(t.dungeon.floor(2));
                } else {
                    setDungeonFloor(1);
                    setDungeonPlayerPos({x: 12, y: 1}); 
                    setExploreLog(t.dungeon.floor(1));
                }
            } else if (tile === 'B') {
                if (!cleared) {
                     setExploreLog(t.dungeon.bossEncounter);
                     setTimeout(() => startBattle(true), 200);
                } else {
                    audioService.playSfx('CONFIRM');
                    if (dungeonFloor === 1) {
                        setDungeonFloor(2);
                        setDungeonPlayerPos({x: 12, y: 1}); 
                        setExploreLog(t.dungeon.floor(2));
                    } else {
                        setGameState(GameState.MAP);
                        setExploreLog("");
                    }
                }
            }
            return;
        }

        let dx = 0;
        let dy = 0;
        if (key === 'UP') dy = -1;
        if (key === 'DOWN') dy = 1;
        if (key === 'LEFT') dx = -1;
        if (key === 'RIGHT') dx = 1;

        const newX = dungeonPlayerPos.x + dx;
        const newY = dungeonPlayerPos.y + dy;

        if (newY >= 0 && newY < dMap.length && newX >= 0 && newX < dMap[0].length) {
            const targetTile = dMap[newY][newX];
            if (targetTile !== 'd' && targetTile !== '_') {
                setDungeonPlayerPos({ x: newX, y: newY });
                audioService.playSfx('SELECT');
                
                if (targetTile !== 'E' && targetTile !== 'S' && targetTile !== 'B') {
                    checkRandomEncounter(targetTile);
                }

                if (targetTile === 'E') setExploreLog(t.dungeon.leave);
                else if (targetTile === 'B') setExploreLog(t.dungeon.bossEncounter);
                else if (targetTile === 'S') setExploreLog(dungeonFloor === 1 ? t.dungeon.goDeeper : t.dungeon.returnSurface);
                else setExploreLog(t.dungeon.search);
            }
        }
    }
    else if (gameState === GameState.BATTLE && battleState === BattleState.PLAYER_INPUT) {
      const actions = ['PHYSICAL', 'MAG_ATK', 'MAG_HEAL', 'ITEM', 'FLEE'] as const;
      if (key === 'UP') setMenuIndex(prev => (prev - 1 + 5) % 5);
      if (key === 'DOWN') setMenuIndex(prev => (prev + 1) % 5);
      if (key === 'ENTER') {
        handlePlayerAction(actions[menuIndex]);
      }
    }
    else if ((battleState === BattleState.VICTORY || battleState === BattleState.DEFEAT) && key === 'ENTER') {
        audioService.playSfx('CONFIRM');
        
        setBattleState(BattleState.PLAYER_INPUT);

        if (battleState === BattleState.VICTORY) {
            if (prevGameState === GameState.MAP || prevGameState === GameState.DUNGEON) {
                 setGameState(prevGameState);
            } else {
                 setGameState(GameState.MAP); 
            }
            setInputCooldown(true);
            setTimeout(() => setInputCooldown(false), 500);
            setMenuIndex(0);
        } else {
            // Apply Penalty Here on Confirmation
            setPlayer((prev: Player) => {
                const penalty = Math.floor((prev.level * 50) * 0.1);
                const currentLevelMinExp = (prev.level - 1) * 50; 
                return {
                    ...prev,
                    hp: prev.maxHp,
                    mp: prev.maxMp,
                    exp: Math.max(currentLevelMinExp, prev.exp - penalty)
                };
            });
            setGameState(GameState.TOWN);
            setSelectedLocation('castle');
            setTownPlayerPos(TOWN_START_POS);
            setTownMessage(lang === Language.ZH ? "你被救回了城鎮，雖然有些損失，但命保住了。" : "You were revived in town. Some XP lost, but you live.");
            setMenuIndex(0);
        }
    }
  }, [gameState, menuIndex, battleState, loading, player, enemy, lang, selectedLocation, playerPos, townPlayerPos, dungeonPlayerPos, activeShop, currentScene, dungeonFloor, dungeonProgress, showSaveMenu, showLoadMenu, playerNameInput, notification, prevGameState, inputCooldown, showReincarnationModal, pendingReincarnationPlayer, townNPCs, showAboutModal, titleSelection, hasSaves]);

  // Click handler for tiles
  const handleMapClick = (targetX: number, targetY: number, type: 'WORLD' | 'TOWN' | 'DUNGEON') => {
      if (loading || showSaveMenu || showLoadMenu || notification || inputCooldown || showReincarnationModal || showAboutModal) return;

      handleUserInteraction();
      let currentPos = playerPos;
      if (type === 'TOWN') currentPos = townPlayerPos;
      if (type === 'DUNGEON') currentPos = dungeonPlayerPos;

      const dx = targetX - currentPos.x;
      const dy = targetY - currentPos.y;

      if (Math.abs(dx) + Math.abs(dy) === 1) {
          if (dy === -1) handleInput('UP');
          if (dy === 1) handleInput('DOWN');
          if (dx === -1) handleInput('LEFT');
          if (dx === 1) handleInput('RIGHT');
      } else if (dx === 0 && dy === 0) {
          handleInput('ENTER');
      }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return; 
      if (gameState === GameState.NAME_INPUT) {
          if (e.key === 'Enter') handleInput('ENTER');
          return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w') handleInput('UP');
      if (e.key === 'ArrowDown' || e.key === 's') handleInput('DOWN');
      if (e.key === 'ArrowLeft' || e.key === 'a') handleInput('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd') handleInput('RIGHT');
      if (e.key === 'Enter' || e.key === ' ') handleInput('ENTER');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, loading, gameState]);

  // --- Render Components ---

  const renderNameInput = () => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in">
            <RetroWindow className="w-full max-w-md border-white bg-blue-900 shadow-2xl p-8 flex flex-col items-center gap-6">
                <h2 className="text-2xl text-yellow-400 font-bold">{t.naming.title}</h2>
                <div className="w-full">
                    <input 
                        type="text" 
                        value={playerNameInput}
                        onChange={handleNameChange}
                        placeholder={t.naming.placeholder}
                        className="w-full bg-black border-2 border-gray-500 text-white text-3xl text-center p-4 outline-none focus:border-yellow-400 font-['VT323']"
                        autoFocus
                    />
                    <div className="text-sm text-gray-400 text-center mt-2">{t.naming.hint}</div>
                </div>
                <RetroButton onClick={submitName} className="bg-red-900 border-red-500 w-2/3 justify-center">
                    {t.naming.confirm}
                </RetroButton>
            </RetroWindow>
        </div>
    );
  };

  const renderAboutModal = () => {
    if (!showAboutModal) return null;

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/95 animate-fade-in p-4" onClick={(e) => e.stopPropagation()}>
             <RetroWindow className="w-full max-w-lg border-yellow-500 bg-blue-900/90 shadow-[0_0_50px_rgba(59,130,246,0.5)] p-6 md:p-8 flex flex-col items-center gap-6">
                <h2 className="text-2xl md:text-3xl text-yellow-400 font-bold border-b-2 border-yellow-600 pb-2 mb-2 font-['DotGothic16'] tracking-widest text-center">
                    {t.about.title}
                </h2>
                
                <div className="text-white text-base md:text-lg text-left leading-relaxed font-serif space-y-4 w-full">
                    <p>{t.about.plot}</p>
                    <p className="text-gray-300">{t.about.gameplay}</p>
                    <div className="border-t border-gray-600 pt-4 mt-4 text-center">
                        <div className="text-yellow-200 font-bold">{t.about.author}</div>
                        <div className="text-blue-300">{t.about.email}</div>
                    </div>
                </div>

                <RetroButton 
                    onClick={() => setShowAboutModal(false)}
                    className="bg-red-900 border-red-500 text-white mt-4 w-auto min-w-[120px] py-1 justify-center text-sm"
                >
                    {t.about.close}
                </RetroButton>
             </RetroWindow>
        </div>
    );
  };

  const renderReincarnationModal = () => {
    if (!showReincarnationModal || !pendingReincarnationPlayer) return null;

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/95 animate-fade-in p-4">
             <RetroWindow className="w-full max-w-lg border-yellow-500 bg-purple-900/90 shadow-[0_0_50px_rgba(168,85,247,0.5)] p-6 md:p-8 flex flex-col items-center gap-6">
                <h2 className="text-3xl md:text-4xl text-yellow-400 font-bold border-b-2 border-yellow-600 pb-2 mb-2 font-['DotGothic16'] tracking-widest text-center">
                    {t.reincarnationModal.title}
                </h2>
                
                <div className="text-white text-base md:text-xl text-center leading-relaxed whitespace-pre-wrap font-serif">
                    {t.reincarnationModal.message(pendingReincarnationPlayer.reincarnationCount)}
                </div>

                <div className="bg-black/50 p-4 rounded border border-purple-400 w-full text-center">
                    <div className="text-green-400 font-bold text-xl md:text-2xl mb-2 animate-pulse">
                        {t.reincarnationModal.bonus}
                    </div>
                </div>

                <RetroButton 
                    onClick={confirmReincarnation}
                    className="bg-yellow-700 border-yellow-400 text-white text-xl py-4 hover:bg-yellow-600 animate-pulse mt-4"
                >
                    {t.reincarnationModal.confirm}
                </RetroButton>
             </RetroWindow>
        </div>
    );
  };

  const renderSaveLoadMenu = () => {
    const isSave = showSaveMenu;
    const title = isSave ? t.saveLoad.saveTitle : t.saveLoad.loadTitle;
    const slots = getSaveSlots();

    return (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <RetroWindow className="w-full max-w-2xl border-yellow-500 bg-blue-900 shadow-2xl">
                <h2 className="text-2xl text-center text-yellow-400 mb-6 border-b border-blue-600 pb-2">{title}</h2>
                {saveMessage && <div className="text-center text-green-300 mb-4 animate-pulse">{saveMessage}</div>}
                <div className="space-y-3">
                    {slots.map((slot, idx) => {
                        const isAutoSave = idx === 4; 
                        const canSave = isSave && !isAutoSave; 
                        const canLoad = !isSave && slot; 

                        return (
                            <div 
                                key={idx}
                                onClick={() => {
                                    if (canSave) saveGame(idx);
                                    else if (canLoad) loadGame(idx);
                                }}
                                className={`
                                    border-2 p-3 transition-all flex justify-between items-center
                                    ${isAutoSave ? 'border-amber-500 bg-amber-900/30' : (slot ? 'border-white bg-blue-800' : 'border-gray-600 bg-gray-900/50')}
                                    ${(canSave || canLoad) ? 'cursor-pointer hover:scale-[1.01] hover:brightness-125' : 'cursor-not-allowed opacity-80'}
                                `}
                            >
                                 <div className="flex flex-col flex-1">
                                     <div className="flex items-center gap-3">
                                         <span className={`font-bold ${isAutoSave ? 'text-amber-400' : 'text-yellow-200'}`}>
                                            {isAutoSave ? t.saveLoad.autoSave : `SLOT ${idx + 1}`}
                                         </span>
                                         {slot && <span className="text-xs text-gray-300">{new Date(slot.timestamp).toLocaleString()}</span>}
                                         {slot && <span className="text-xs text-purple-300 bg-purple-900/50 px-2 rounded-full border border-purple-500">{t.reincarnationLabel}: {slot.player.reincarnationCount || 0}</span>}
                                     </div>
                                     {slot ? (
                                         <div className="mt-1 text-sm text-gray-200 flex justify-between w-full pr-4">
                                             <span>Lv.{slot.player.level} {slot.player.name}</span>
                                             <span>{slot.locationLabel}</span>
                                         </div>
                                     ) : (
                                         <span className="text-gray-500 italic mt-1">{t.saveLoad.emptySlot}</span>
                                     )}
                                 </div>
                            </div>
                        );
                    })}
                    
                    <RetroButton 
                        onClick={() => { setShowSaveMenu(false); setShowLoadMenu(false); }}
                        className="bg-red-900 border-red-500 mt-6"
                    >
                        {t.saveLoad.backBtn}
                    </RetroButton>
                </div>
            </RetroWindow>
        </div>
    );
  };

  const renderTitle = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center animate-fade-in p-4">
       <div 
         className="absolute top-4 right-4 text-gray-400 font-mono text-lg md:text-2xl z-50 opacity-80 font-bold cursor-pointer hover:text-yellow-400 transition-colors underline decoration-dotted decoration-gray-600 hover:decoration-yellow-400"
         onClick={(e) => { e.stopPropagation(); setShowAboutModal(true); }}
         title={t.about.title}
       >
          {GAME_VERSION}
       </div>
       
       <div 
          className="absolute inset-0 z-0 opacity-60" 
          style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?q=80&w=2000&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'sepia(0.5) contrast(1.2) brightness(0.6)'
          }}
       ></div>
       
       <div className="z-10 flex flex-col items-center w-full max-w-4xl">
          <div 
              className="mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-bounce-slight cursor-pointer hover:scale-105 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                handleUserInteraction();
                audioService.playSfx('WIN'); 
                setPlayer({...GOD_MODE_PLAYER});
                setGameState(GameState.MAP);
                setMapMessage(t.dungeon.title);
              }}
              title="???"
          >
             <TitleBadge className="w-32 h-32 md:w-48 md:h-48" />
          </div>

          <h1 className="text-5xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] font-bold tracking-widest leading-none mb-4 font-['VT323'] whitespace-nowrap">
            {t.title}
          </h1>
          <p className="text-sm md:text-2xl text-yellow-100 drop-shadow-md mb-8 tracking-wider bg-black/60 px-6 py-2 rounded-full border border-yellow-800/50">
             {lang === Language.ZH ? 'EP1：勇者與清秀佳人在愛德華王子島的冒險' : 'EP1: The Adventure of the Hero and Anne on Prince Edward Island'}
          </p>

          <div className="flex flex-col items-center gap-4 w-64">
            <RetroButton 
                onClick={() => handleInput('ENTER')} 
                active={titleSelection === 0}
                onMouseEnter={() => setTitleSelection(0)}
                className="justify-center text-2xl border-2 border-yellow-500 bg-black/80 hover:bg-red-900"
            >
                {t.start}
            </RetroButton>

            <RetroButton 
                onClick={(e) => { e.stopPropagation(); setShowLoadMenu(true); audioService.playSfx('SELECT'); }} 
                active={titleSelection === 1}
                onMouseEnter={() => setTitleSelection(1)}
                className={`justify-center text-xl border-2 border-blue-500 bg-black/80 hover:bg-blue-900 flex items-center gap-2 ${!hasSaves ? 'opacity-70' : ''}`}
            >
                {hasSaves && <span className="text-green-400 animate-pulse text-xs">●</span>}
                {t.continue}
            </RetroButton>

            <div className="flex gap-4 mt-4">
                <button 
                onClick={(e) => { e.stopPropagation(); handleUserInteraction(); setLang(Language.ZH); audioService.playSfx('SELECT'); }} 
                className={`px-4 py-1 text-sm border ${lang===Language.ZH ? 'bg-yellow-600 text-white border-white' : 'bg-black/50 text-gray-400 border-gray-600'}`}
                >
                中文
                </button>
                <button 
                onClick={(e) => { e.stopPropagation(); handleUserInteraction(); setLang(Language.EN); audioService.playSfx('SELECT'); }} 
                className={`px-4 py-1 text-sm border ${lang===Language.EN ? 'bg-yellow-600 text-white border-white' : 'bg-black/50 text-gray-400 border-gray-600'}`}
                >
                EN
                </button>
            </div>
          </div>
       </div>
    </div>
  );

  const renderWorldMap = () => {
    const MAP_DATA = getCurrentMapData();
    const mapName = currentScene === 'AVONLEA' ? t.scenes.avonlea : (currentScene === 'CAVENDISH' ? t.scenes.cavendish : t.scenes.charlottetown);
    
    const showAvonlea = currentScene !== 'AVONLEA';
    const showCavendish = currentScene !== 'CAVENDISH' && dungeonProgress.avonlea.b2;
    const showCharlottetown = currentScene !== 'CHARLOTTETOWN' && dungeonProgress.cavendish.b2;

    return (
    <div className="flex flex-col md:flex-row h-full bg-black gap-2">
      <div className="w-full md:w-1/4 min-w-[200px] flex flex-col gap-2 order-1">
         <RetroWindow className="flex justify-between items-center py-2 bg-slate-900 border-slate-500">
             <h2 className="text-base lg:text-xl text-yellow-300 tracking-wider flex items-center gap-2">
                 <span>🗺️</span> {t.worldMapName}
             </h2>
         </RetroWindow>
         <div className="flex-1">
            <StatusPanel player={player} t={t} />
         </div>
      </div>
      
      <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden relative border-4 border-gray-700 rounded p-4 items-center justify-center order-2">
          <span className="absolute top-2 left-2 z-10 text-lg md:text-xl font-bold text-yellow-300 bg-black/50 px-3 py-1 border border-yellow-600 rounded">
              {mapName}
          </span>
          <span className="absolute bottom-2 right-2 z-10 text-xs md:text-sm text-gray-300 animate-pulse bg-black/50 px-2 rounded">
              {mapMessage || "Navigate with Arrow Keys or Click"}
          </span>
          
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
              {showCharlottetown && (
                  <button onClick={() => switchScene('CHARLOTTETOWN')} className="bg-blue-800 text-white px-3 py-1 border border-white hover:bg-blue-600 text-xs md:text-sm font-bold">
                      ✈ {t.scenes.charlottetown}
                  </button>
              )}
               {showCavendish && (
                  <button onClick={() => switchScene('CAVENDISH')} className="bg-purple-800 text-white px-3 py-1 border border-white hover:bg-purple-600 text-xs md:text-sm font-bold">
                      ✈ {t.scenes.cavendish}
                  </button>
              )}
              {showAvonlea && (
                  <button onClick={() => switchScene('AVONLEA')} className="bg-green-800 text-white px-3 py-1 border border-white hover:bg-green-600 text-xs md:text-sm font-bold">
                      ✈ {t.scenes.avonlea}
                  </button>
              )}
          </div>

          <div 
             className="grid gap-[1px] bg-black border-4 border-gray-600 shadow-2xl"
             style={{ 
                 gridTemplateColumns: `repeat(${MAP_DATA[0].length}, minmax(0, 1fr))`,
                 width: '100%',
                 maxWidth: '800px',
                 aspectRatio: `${MAP_DATA[0].length}/${MAP_DATA.length}`
             }}
          >
              {MAP_DATA.map((row: TileType[], y: number) => (
                  row.map((tile: TileType, x: number) => {
                      const isPlayerHere = x === playerPos.x && y === playerPos.y;
                      return (
                          <div 
                              key={`${x}-${y}`}
                              onClick={() => handleMapClick(x, y, 'WORLD')}
                              className={`
                                relative flex items-center justify-center text-sm md:text-3xl select-none cursor-pointer hover:brightness-110
                                ${TILE_COLORS[tile as TileType]}
                                transition-colors duration-300
                              `}
                          >
                              <span className="opacity-80 scale-75 md:scale-100 drop-shadow-md">{TILE_ICONS[tile as TileType]}</span>
                              {isPlayerHere && (
                                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-1">
                                      <div className="w-full h-full animate-bounce">
                                        <img 
                                            src={PLAYER_SPRITE_URL} 
                                            alt="Player" 
                                            className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-x-[-1]" 
                                        />
                                      </div>
                                  </div>
                              )}
                          </div>
                      );
                  })
              ))}
          </div>
      </div>
    </div>
    );
  };

  const renderTown = () => {
    const renderContent = () => {
        if (activeShop) {
            let shopName = "";
            let npcImage = "";
            let actionText = "";

            if (activeShop === 'GUILD') { shopName = t.town.shops.guild; npcImage = SHOP_IMAGES.guild; actionText = t.town.actions.rest(20); }
            if (activeShop === 'WEAPON') { shopName = t.town.shops.weapon; npcImage = SHOP_IMAGES.weapon; actionText = t.town.actions.buyWeapon(100 * player.level); }
            if (activeShop === 'ARMOR') { shopName = t.town.shops.armor; npcImage = SHOP_IMAGES.armor; actionText = t.town.actions.buyArmor(100 * player.level); }
            if (activeShop === 'ITEM') { shopName = t.town.shops.item; npcImage = SHOP_IMAGES.item; actionText = t.town.actions.buyPotion(20); }
            if (activeShop === 'MAGIC') { shopName = t.town.shops.magic; npcImage = SHOP_IMAGES.magic; actionText = t.town.actions.buyMagic(200 * player.level); }

            return (
                <div className="flex-1 relative flex flex-col border-4 border-yellow-700 rounded overflow-hidden bg-[#2a1d15] order-2">
                     <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                          <div className="bg-black/50 border-4 border-yellow-600 rounded-full p-2 mb-4 md:mb-6 shadow-2xl">
                              <img 
                                src={npcImage} 
                                alt="Shop Keeper" 
                                className="w-24 h-24 md:w-48 md:h-48 rounded-full object-cover bg-gray-800"
                              />
                          </div>
                          
                          <RetroWindow className="w-full max-w-lg mb-4 md:mb-8 bg-black/80 border-yellow-500">
                                <h2 className="text-xl md:text-3xl text-yellow-400 text-center border-b border-gray-600 pb-2 mb-2">{shopName}</h2>
                                <p className="text-center text-white text-sm md:text-lg italic">"{townMessage || t.town.welcome}"</p>
                          </RetroWindow>
                          
                          <div className="w-full max-w-md space-y-4">
                              <RetroButton 
                                active={menuIndex === 0}
                                onClick={() => handleShopTransaction(0)}
                                className="bg-blue-900/90 border-blue-400 py-2 md:py-4 text-sm md:text-xl"
                              >
                                {activeShop === 'ITEM' && <span className="mr-2 text-red-500">🔴</span>}
                                {actionText}
                              </RetroButton>
                              <RetroButton 
                                active={menuIndex === 1}
                                onClick={() => handleShopTransaction(1)}
                                className="bg-red-900/90 border-red-400 py-2 md:py-4 text-sm md:text-xl"
                              >
                                {t.town.actions.leave}
                              </RetroButton>
                          </div>
                     </div>
                </div>
            );
        } else {
            return (
                <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative border-4 border-slate-700 rounded p-4 items-center justify-center order-2">
                    <div className="absolute top-2 left-2 right-2 z-20 flex justify-center pointer-events-none">
                         {townMessage && (
                            <div className="bg-black/80 border-2 border-white px-4 py-2 rounded-lg max-w-2xl animate-fade-in-up">
                                <span className="text-xl md:text-2xl text-yellow-300 font-bold leading-relaxed text-left block font-serif">
                                    {townMessage}
                                </span>
                            </div>
                         )}
                         {!townMessage && (
                            <span className="text-xs md:text-sm text-gray-300 bg-black/50 px-2 rounded self-center">
                                {t.town.welcome}
                            </span>
                         )}
                    </div>

                    <div 
                        className="grid gap-[1px] bg-black border-4 border-slate-500 shadow-2xl mt-8"
                        style={{ 
                            gridTemplateColumns: `repeat(${TOWN_MAP[0].length}, minmax(0, 1fr))`,
                            width: '100%',
                            maxWidth: '800px',
                            aspectRatio: `${TOWN_MAP[0].length}/${TOWN_MAP.length}`
                        }}
                    >
                        {TOWN_MAP.map((row: TownTileType[], y: number) => (
                            row.map((tile: TownTileType, x: number) => {
                                const isPlayerHere = x === townPlayerPos.x && y === townPlayerPos.y;
                                const npc = townNPCs.find(n => n.x === x && n.y === y);

                                return (
                                    <div 
                                        key={`${x}-${y}`}
                                        onClick={() => handleMapClick(x, y, 'TOWN')}
                                        className={`
                                            relative flex items-center justify-center text-sm md:text-3xl select-none cursor-pointer hover:brightness-110
                                            ${TILE_COLORS[tile as TownTileType]}
                                        `}
                                    >
                                        <span className="opacity-90 scale-75 md:scale-100 drop-shadow-md">{TILE_ICONS[tile as TownTileType]}</span>
                                        {npc && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                                <img 
                                                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${npc.avatarSeed}`}
                                                    alt={npc.name}
                                                    className="w-3/4 h-3/4 object-contain"
                                                />
                                                {getDist({x,y}, townPlayerPos) <= 1 && (
                                                    <div className="absolute -top-1 -right-1 bg-white text-black text-[8px] px-1 rounded-full animate-bounce">💬</div>
                                                )}
                                                {npc.reward && !npc.rewardClaimed && (
                                                     <div className="absolute top-0 left-0 text-[10px] animate-pulse">✨</div>
                                                )}
                                            </div>
                                        )}
                                        {isPlayerHere && (
                                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-1">
                                                <div className="w-full h-full animate-bounce">
                                                    <img 
                                                        src={PLAYER_SPRITE_URL} 
                                                        alt="Player" 
                                                        className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-x-[-1]" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
      <div className="flex flex-col md:flex-row h-full bg-black gap-2">
          <div className="w-full md:w-1/4 min-w-[200px] flex flex-col gap-2 order-1">
               <RetroWindow className="flex justify-between items-center py-2 bg-slate-900 border-slate-500">
                     <h2 className="text-base lg:text-xl text-yellow-300 tracking-wider flex items-center gap-2">
                         <span>🏰</span> Thanksgiving Keep
                     </h2>
               </RetroWindow>
               <div className="flex-1">
                 <StatusPanel player={player} t={t} />
               </div>
          </div>
          {renderContent()}
      </div>
    );
  };

  const renderDungeon = () => {
    const dMap = getDungeonMap();
    
    // Check Boss Clearance for visual update
    let cleared = false;
    if (currentScene === 'AVONLEA') {
        cleared = dungeonFloor === 1 ? dungeonProgress.avonlea.b1 : dungeonProgress.avonlea.b2;
    } else if (currentScene === 'CAVENDISH') {
        cleared = dungeonFloor === 1 ? dungeonProgress.cavendish.b1 : dungeonProgress.cavendish.b2;
    } else if (currentScene === 'CHARLOTTETOWN') {
        cleared = dungeonFloor === 1 ? dungeonProgress.charlottetown.b1 : dungeonProgress.charlottetown.b2;
    }

    return (
      <div className="flex flex-col md:flex-row h-full bg-slate-900 gap-2">
          {/* Left Panel: Status Only */}
          <div className="w-full md:w-1/4 min-w-[220px] flex flex-col gap-2 order-1">
               <RetroWindow className="bg-blue-900/50 border-blue-400 flex flex-row items-center justify-center p-2 gap-4">
                    <span className="text-3xl">💀</span>
                    <h2 className="text-xl text-blue-300 animate-pulse whitespace-nowrap">
                        {t.dungeon.floor(dungeonFloor)}
                    </h2>
               </RetroWindow>

               <div className="flex-1">
                 <StatusPanel player={player} t={t} />
               </div>
          </div>

          <div className="flex-1 flex flex-col bg-black overflow-hidden relative border-4 border-blue-800 rounded p-4 items-center justify-center order-2">
              <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ backgroundImage: `url("${LOCATION_IMAGES.volcano}")`, backgroundSize: 'cover' }}
              ></div>
              
              <span className="absolute top-2 left-2 z-10 text-lg font-bold text-blue-300 bg-black/50 px-3 py-1 border border-blue-600 rounded">
                 {exploreLog || t.dungeon.title}
              </span>

              <div 
                  className="grid gap-[1px] bg-black border-4 border-blue-900 shadow-2xl z-10"
                  style={{ 
                      gridTemplateColumns: `repeat(${dMap[0].length}, minmax(0, 1fr))`,
                      width: '100%',
                      maxWidth: '800px',
                      aspectRatio: `${dMap[0].length}/${dMap.length}`
                  }}
              >
                  {dMap.map((row: DungeonTileType[], y: number) => (
                      row.map((tile: DungeonTileType, x: number) => {
                          const isPlayerHere = x === dungeonPlayerPos.x && y === dungeonPlayerPos.y;
                          
                          // Dynamic Tile Logic
                          let displayTile = tile;
                          if (tile === 'B' && cleared) {
                              // If Boss is dead, show Stairs Down (B1) or Exit (B2)
                              displayTile = dungeonFloor === 1 ? 'S' : 'E';
                          }

                          return (
                              <div 
                                  key={`${x}-${y}`}
                                  onClick={() => handleMapClick(x, y, 'DUNGEON')}
                                  className={`
                                    relative flex items-center justify-center text-sm md:text-3xl select-none cursor-pointer hover:brightness-110
                                    ${TILE_COLORS[displayTile as DungeonTileType]}
                                  `}
                              >
                                  <span className="opacity-90 scale-75 md:scale-100 drop-shadow-md">{TILE_ICONS[displayTile as DungeonTileType]}</span>
                                  
                                  {isPlayerHere && (
                                      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-1">
                                          <div className="w-full h-full animate-bounce">
                                            <img 
                                                src={PLAYER_SPRITE_URL} 
                                                alt="Player" 
                                                className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-x-[-1]" 
                                            />
                                          </div>
                                      </div>
                                  )}
                              </div>
                          );
                      })
                  ))}
              </div>
          </div>
      </div>
    );
  };

  const getLevelColor = (level: number, isBoss: boolean) => {
      if (isBoss) return "text-red-600 animate-pulse font-extrabold shadow-white";
      
      let min = 1;
      let max = 8;
      let additive = 0;
      if (currentScene === 'CAVENDISH') additive = 5;
      if (currentScene === 'CHARLOTTETOWN') additive = 10;
      
      if (gameState === GameState.DUNGEON) {
          min = (dungeonFloor === 1 ? 5 : 8) + additive;
          max = (dungeonFloor === 1 ? 9 : 10) + additive;
      } else {
          if (currentScene === 'AVONLEA') { min = 1; max = 8; }
          if (currentScene === 'CAVENDISH') { min = 6; max = 13; }
          if (currentScene === 'CHARLOTTETOWN') { min = 11; max = 18; }
      }
      
      const range = max - min;
      const lowCap = min + (range / 3);
      const highStart = max - (range / 3);

      if (level <= lowCap) return "text-green-400 font-bold";
      if (level >= highStart) return "text-orange-500 font-bold";
      return "text-yellow-400 font-bold";
  };

  const renderBattle = () => (
    <div className="flex flex-col md:flex-row h-full relative gap-2 bg-black">
      <div className="w-full md:w-1/4 min-w-[200px] flex flex-col order-1">
          <StatusPanel player={player} t={t} /> 
      </div>

      <div className="flex-1 flex flex-col h-full gap-2 order-2">
          <div 
            className="flex-[2] relative bg-black border-4 border-white rounded overflow-hidden flex items-center justify-center bg-cover bg-center transition-all duration-500"
            style={{ 
                backgroundImage: selectedLocation ? `url("${LOCATION_IMAGES[selectedLocation]}")` : 'none',
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
            
            {loading && <div className="text-3xl animate-pulse text-white font-bold tracking-widest">{t.loading}</div>}
            
            {!loading && enemy && (
                <div className={`relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full max-w-4xl p-4 transition-opacity duration-300 ${battleState === BattleState.VICTORY ? 'opacity-40 blur-sm' : 'opacity-100'}`}>
                    <div className="w-1/2 flex items-center justify-center animate-bounce-slight">
                        <img 
                            src={enemy.imageUrl} 
                            alt={enemy.name}
                            className={`object-contain pixelated drop-shadow-[0_0_20px_rgba(255,0,0,0.4)] ${enemy.isBoss ? 'w-48 h-48 md:w-80 md:h-80 filter saturate-150' : 'w-32 h-32 md:w-64 md:h-64'}`}
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    
                    <div className="w-full md:w-1/2 bg-black/80 p-2 md:p-6 border-2 border-white text-left rounded-lg shadow-xl backdrop-blur-md">
                        <div className={`text-lg md:text-3xl font-bold mb-2 tracking-widest flex items-center gap-2`}>
                            <span className={`text-xs md:text-base align-middle mr-1 border border-current px-1 rounded ${getLevelColor(enemy.level, !!enemy.isBoss)}`}>Lv.{enemy.level}</span>
                            <span className="text-red-400 truncate">{enemy.name}</span>
                        </div>
                        <div className="hidden md:block text-lg text-gray-300 italic mb-4 font-serif leading-snug">{enemy.description}</div>
                        
                        <div className="grid grid-cols-2 gap-x-2 md:gap-x-4 gap-y-1 md:gap-y-2 text-sm md:text-lg mb-2 md:mb-4 font-mono">
                            <div className="text-green-400">HP: {enemy.hp.toLocaleString()}</div>
                            <div className="text-blue-400">MP: {enemy.mp?.toLocaleString() || '??'}</div>
                            <div className="text-red-400">ATK: {enemy.attack.toLocaleString()}</div>
                            <div className="text-yellow-400">DEF: {enemy.defense?.toLocaleString() || '??'}</div>
                        </div>

                        <div className="w-full bg-gray-800 h-4 md:h-6 rounded-full overflow-hidden border border-gray-600">
                            <div 
                                className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500 shadow-[0_0_10px_red]" 
                                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {(battleState === BattleState.VICTORY || battleState === BattleState.DEFEAT) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                    <div className={`text-4xl md:text-8xl font-bold mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(0,0,0,1)] ${battleState === BattleState.VICTORY ? 'text-yellow-400' : 'text-red-700 font-["Nosifer"]'}`}>
                        {battleState === BattleState.VICTORY ? 
                           (enemy?.isBoss ? (lang === Language.ZH ? '大獲全勝！' : 'GLORIOUS VICTORY!') : (lang === Language.ZH ? '勝利！' : 'VICTORY!')) 
                           : (lang === Language.ZH ? '全軍覆沒...' : 'DEFEAT...')}
                    </div>
                    
                    {battleState === BattleState.DEFEAT && (
                        <div className="bg-red-900/90 border-2 border-white px-4 py-2 text-lg md:text-xl text-yellow-300 mb-4 animate-pulse shadow-lg pointer-events-auto">
                            {lang === Language.ZH 
                                ? `HP/MP 歸零... 失去意識。\n預計損失經驗值: ${Math.floor((player.level * 50) * 0.1)}`
                                : `HP/MP Depleted... Passed out.\nEst. XP Loss: ${Math.floor((player.level * 50) * 0.1)}`}
                        </div>
                    )}

                    {!showReincarnationModal && (
                        <div className="bg-blue-900/90 border-2 border-white px-8 py-4 text-xl md:text-2xl animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.6)] rounded-lg pointer-events-auto cursor-pointer mt-4" onClick={() => handleInput('ENTER')}>
                            {lang === Language.ZH ? '點擊任意處繼續 ▶' : 'Click Anywhere to Continue ▶'}
                        </div>
                    )}
                </div>
            )}
          </div>

          <div className="flex-1 flex gap-2 min-h-[140px] md:min-h-[160px]">
             <RetroWindow className="w-1/3 flex flex-col justify-center space-y-1 overflow-y-auto">
                {['PHYSICAL', 'MAG_ATK', 'MAG_HEAL', 'ITEM', 'FLEE'].map((action, idx) => (
                    <RetroButton 
                        key={action}
                        active={battleState === BattleState.PLAYER_INPUT && menuIndex === idx}
                        onClick={() => { 
                            handleUserInteraction();
                            if(battleState === BattleState.PLAYER_INPUT) {
                                setMenuIndex(idx); 
                                handlePlayerAction(action as any); 
                            }
                        }}
                        onMouseEnter={() => {
                            if (battleState === BattleState.PLAYER_INPUT) {
                                setMenuIndex(idx);
                                audioService.playSfx('SELECT');
                            }
                        }}
                        disabled={battleState !== BattleState.PLAYER_INPUT}
                        className={`${battleState !== BattleState.PLAYER_INPUT ? 'opacity-50' : ''} text-sm md:text-lg py-1 md:py-2`}
                    >
                        {action === 'PHYSICAL' ? t.cmdPhysical : 
                        action === 'MAG_ATK' ? t.cmdMagAtk : 
                        action === 'MAG_HEAL' ? t.cmdMagHeal : 
                        action === 'ITEM' ? t.cmdItem : t.cmdFlee}
                    </RetroButton>
                ))}
             </RetroWindow>

             <RetroWindow className="flex-1 overflow-hidden flex flex-col bg-blue-900/90" title="ADVENTURE LOG">
                <div className="flex-1 overflow-y-auto font-mono text-sm md:text-base leading-relaxed space-y-1 p-2" ref={scrollRef}>
                    {battleLogs.map((log, i) => (
                        <div key={i} className="animate-fade-in-up border-b border-blue-800/50 pb-1 last:border-0">
                            <span className="text-yellow-400 mr-2">➤</span>{log}
                        </div>
                    ))}
                </div>
             </RetroWindow>
          </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center p-0 md:p-4 select-none font-['DotGothic16']" onClick={handleUserInteraction}>
      <div className="scanlines"></div>
      
      {(gameState === GameState.MAP || gameState === GameState.TOWN || gameState === GameState.DUNGEON) && (
          <div className="fixed top-2 right-16 md:top-6 md:right-24 z-[100] flex gap-2">
            <button 
              onClick={handleReturnToTitle}
              className="bg-red-800 border-2 border-red-400 text-white px-3 py-1 md:px-4 md:py-2 rounded-full font-bold shadow-lg hover:bg-red-700 active:scale-95 flex items-center gap-2 text-xs md:text-base"
              title={t.saveLoad.returnTitle}
            >
                🏠 <span className="hidden md:inline">{t.saveLoad.returnTitle}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSaveMenu(true); audioService.playSfx('SELECT'); }}
              className="bg-green-800 border-2 border-green-400 text-white px-3 py-1 md:px-4 md:py-2 rounded-full font-bold shadow-lg hover:bg-green-700 active:scale-95 flex items-center gap-2 text-xs md:text-base"
              title={t.saveLoad.saveBtn}
            >
                💾 <span className="hidden md:inline">{t.saveLoad.saveBtn}</span>
            </button>
          </div>
      )}

      <button 
        onClick={toggleMute}
        className="fixed top-2 right-2 md:top-6 md:right-6 z-[100] bg-gray-800 border-2 border-white text-white w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:bg-gray-700 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
            <span className="text-xl md:text-3xl filter grayscale opacity-50">🔇</span>
        ) : (
            <span className="text-xl md:text-3xl">🔊</span>
        )}
      </button>

      {(showSaveMenu || showLoadMenu) && renderSaveLoadMenu()}
      
      {showAboutModal && renderAboutModal()}

      {showReincarnationModal && renderReincarnationModal()}

      {notification && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80">
              <div className="bg-blue-900 border-2 border-white px-8 py-4 text-xl text-yellow-300 animate-pulse shadow-xl rounded">
                  {notification}
              </div>
          </div>
      )}
      
      <div className="w-full max-w-[1280px] h-[100dvh] md:max-h-[90vh] md:aspect-video bg-gray-900 relative shadow-2xl flex flex-col border-0 md:border-[12px] border-gray-700 rounded-none md:rounded-xl overflow-hidden box-border">
        <div className="flex-1 p-0 md:p-6 bg-[#0a0a0a] relative flex flex-col">
            {gameState === GameState.TITLE && renderTitle()}
            {gameState === GameState.NAME_INPUT && renderNameInput()}
            {gameState === GameState.MAP && renderWorldMap()}
            {gameState === GameState.TOWN && renderTown()}
            {gameState === GameState.DUNGEON && renderDungeon()}
            {gameState === GameState.BATTLE && renderBattle()}
        </div>
      </div>

      <VirtualPad 
        onUp={() => handleInput('UP')}
        onDown={() => handleInput('DOWN')}
        onSelect={() => handleInput('ENTER')}
      />
      
      {(gameState === GameState.MAP || (gameState === GameState.TOWN && !activeShop) || gameState === GameState.DUNGEON) && (
        <div className="fixed bottom-4 left-4 z-50 md:hidden flex gap-4 opacity-80">
             <button 
               onClick={() => handleInput('LEFT')}
               className="w-14 h-14 bg-gray-700 rounded-full border-2 border-white text-2xl flex items-center justify-center shadow-lg active:bg-gray-500"
             >◀</button>
             <button 
               onClick={() => handleInput('RIGHT')}
               className="w-14 h-14 bg-gray-700 rounded-full border-2 border-white text-2xl flex items-center justify-center shadow-lg active:bg-gray-500 ml-16"
             >▶</button>
        </div>
      )}
    </div>
  );
};