
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RetroWindow, RetroButton } from './components/RetroUI';
import { VirtualPad } from './components/VirtualPad';
import { generateDinosaur } from './services/geminiService';
import { audioService } from './services/audioService';
import { Language, GameState, Player, Enemy, BattleState, Translation, ShopType, SceneType, DungeonProgress, TileType, TownTileType, SaveData } from './types';
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
  MAP_START_POS,
  TOWN_START_POS,
  TILE_COLORS,
  TILE_ICONS,
  ENCOUNTER_RATES,
  PLAYER_SPRITE_URL,
  TITLE_BADGE_URL
} from './constants';

const App: React.FC = () => {
  // --- State ---
  const [lang, setLang] = useState<Language>(Language.ZH);
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [prevGameState, setPrevGameState] = useState<GameState>(GameState.MAP);
  const [player, setPlayer] = useState<Player>({ ...INITIAL_PLAYER });
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [battleState, setBattleState] = useState<BattleState>(BattleState.PLAYER_INPUT);
  const [menuIndex, setMenuIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Name Input State
  const [playerNameInput, setPlayerNameInput] = useState("");
  
  // Save/Load Menu State
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [notification, setNotification] = useState("");
  const [hasSaves, setHasSaves] = useState(false); // New state to track if any saves exist

  // World Map State
  const [currentScene, setCurrentScene] = useState<SceneType>('AVONLEA');
  const [playerPos, setPlayerPos] = useState({ x: MAP_START_POS.x, y: MAP_START_POS.y });
  const [mapMessage, setMapMessage] = useState<string>("");

  // Town State
  const [townPlayerPos, setTownPlayerPos] = useState({ x: TOWN_START_POS.x, y: TOWN_START_POS.y });
  const [activeShop, setActiveShop] = useState<ShopType>(null);
  const [townMessage, setTownMessage] = useState<string>("");

  // Dungeon State
  const [dungeonFloor, setDungeonFloor] = useState<number>(1);
  const [dungeonProgress, setDungeonProgress] = useState<DungeonProgress>({ b1Cleared: false, b2Cleared: false, scene2Unlocked: false });
  const [selectedLocation, setSelectedLocation] = useState<keyof typeof LOCATION_IMAGES | null>(null);
  const [exploreLog, setExploreLog] = useState<string>("");

  // Helpers
  const t = TRANSLATIONS[lang];
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const getCurrentMapData = () => {
    if (currentScene === 'CHARLOTTETOWN') return MAP_CHARLOTTETOWN;
    if (currentScene === 'CAVENDISH') return MAP_CAVENDISH;
    return MAP_AVONLEA;
  };

  // Initialize Audio on first interaction
  const handleUserInteraction = () => {
    audioService.init().catch(console.error);
    
    // Global click handler for Victory/Defeat states to return to map
    if (battleState === BattleState.VICTORY || battleState === BattleState.DEFEAT) {
        handleInput('ENTER');
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    handleUserInteraction();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    audioService.playSfx('SELECT');
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

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // BGM Manager
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

  // Passive Effects Timer
  useEffect(() => {
    if (gameState !== GameState.MAP) return;

    const interval = setInterval(() => {
        const mapData = getCurrentMapData();
        const tile = mapData[playerPos.y][playerPos.x];
        let effected = false;

        // Green Gables Effect (HP/MP Regen)
        if (tile === 'H' && (player.hp < player.maxHp || player.mp < player.maxMp)) {
             setPlayer(p => ({
                 ...p,
                 hp: Math.min(p.maxHp, p.hp + 1),
                 mp: Math.min(p.maxMp, p.mp + 1)
             }));
             effected = true;
        }

        // School Effect (Gold)
        if (tile === 'K') {
            setPlayer(p => ({ ...p, gold: p.gold + 10 }));
            effected = true;
        }

        // Academy Effect (Stats)
        if (tile === 'U') {
            setPlayer(p => ({ 
                ...p, 
                equipmentAtk: p.equipmentAtk + 2,
                equipmentDef: p.equipmentDef + 2
            }));
            effected = true;
        }
        
        if (effected) {
             // Optional: visual feedback handled by UI update
        }

    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, playerPos, player, currentScene]);

  // --- Naming Logic ---
  
  const getVisualLength = (str: string) => {
      // RegEx to count non-ASCII (Double byte) as 2, others as 1
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
      setDungeonFloor(1);
      setDungeonProgress({ b1Cleared: false, b2Cleared: false, scene2Unlocked: false });
      setMapMessage(t.dungeon.title);
  };

  // --- Save/Load Logic ---

  const getSaveSlots = (): (SaveData | null)[] => {
      const slots = [];
      // 5 Slots now (0-3 Manual, 4 Auto)
      for(let i=1; i<=5; i++) {
          const data = localStorage.getItem(`turkey_quest_save_${i}`);
          slots.push(data ? JSON.parse(data) : null);
      }
      return slots;
  };

  const createSaveData = (overridePlayer?: Player): SaveData => {
      const locationLabel = gameState === GameState.DUNGEON 
        ? `${t.dungeon.floor(dungeonFloor)}` 
        : (gameState === GameState.TOWN ? t.town.welcome.split(' ')[2] || 'Town' : (currentScene === 'AVONLEA' ? t.scenes.avonlea : (currentScene === 'CAVENDISH' ? 'Cavendish' : t.scenes.charlottetown)));

      return {
          player: overridePlayer || player,
          currentScene,
          playerPos,
          townPlayerPos,
          dungeonFloor,
          dungeonProgress,
          timestamp: Date.now(),
          locationLabel
      };
  };

  const performSave = (slotIndex: number, data: SaveData) => {
      localStorage.setItem(`turkey_quest_save_${slotIndex + 1}`, JSON.stringify(data));
      setHasSaves(true); // Update hasSaves state immediately
  };

  const saveGame = (slotIndex: number) => {
      // Manual Save (0-3)
      performSave(slotIndex, createSaveData());
      audioService.playSfx('WIN');
      setSaveMessage(t.saveLoad.savedMsg);
      setTimeout(() => {
          setSaveMessage("");
          setShowSaveMenu(false);
      }, 1000);
  };

  const autoSaveGame = (currentPlayerState: Player) => {
      // Auto Save to Slot 5 (Index 4)
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
      setDungeonProgress(data.dungeonProgress);
      
      // Determine GameState based on context
      if (data.dungeonFloor > 0 && data.locationLabel.includes('B')) {
          setGameState(GameState.DUNGEON); // Rough heuristic
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
      // Auto Save first
      autoSaveGame(player);
      
      // Show Notification
      setNotification(t.saveLoad.returningMsg);
      
      setTimeout(() => {
          setNotification("");
          setGameState(GameState.TITLE);
          checkSaves(); // Re-check saves when returning to title
      }, 1500);
  };

  // --- Logic ---

  const addLog = (msg: string) => {
    setBattleLogs(prev => [...prev.slice(-4), msg]); // Keep last 5 messages
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
    // Determine Level Range based on Scene & Location
    let sceneMin = 1;
    let sceneMax = 8;
    
    if (gameState === GameState.DUNGEON) {
        if (dungeonFloor === 1) { return Math.floor(Math.random() * (9 - 5 + 1)) + 5; } // 5-9
        if (dungeonFloor === 2) { return Math.floor(Math.random() * (10 - 8 + 1)) + 8; } // 8-10
        if (isBoss) return dungeonFloor === 1 ? 12 : 15;
    } 
    else if (currentScene === 'AVONLEA') {
        sceneMin = 1; sceneMax = 8;
    } 
    else if (currentScene === 'CAVENDISH') {
        sceneMin = 8; sceneMax = 15;
    }
    else if (currentScene === 'CHARLOTTETOWN') {
        sceneMin = 12; sceneMax = 20;
    }

    // Zone Scaling Logic (Director's Request)
    const totalRange = sceneMax - sceneMin;
    const oneThird = totalRange / 3;
    
    // Ranges
    const lowEndMax = Math.floor(sceneMin + oneThird);
    const highEndMin = Math.ceil(sceneMin + (oneThird * 2));

    // Zone 1: Safe Zone (Near Town C) radius 5 OR Green Gables H radius 3
    const townLoc = findTileLocation(mapData, 'C');
    if (townLoc && getDist(currentPos, townLoc) <= 5) {
        return Math.floor(Math.random() * (lowEndMax - sceneMin + 1)) + sceneMin;
    }

    // Zone 2: Danger Zone (Near Dungeon V) radius 3
    const dungeonLocV = findTileLocation(mapData, 'V');
    
    if (dungeonLocV && getDist(currentPos, dungeonLocV) <= 3) {
         return Math.floor(Math.random() * (sceneMax - highEndMin + 1)) + highEndMin;
    }

    // Zone 3: Middle Zone (Everything else)
    const midMin = lowEndMax + 1;
    const midMax = highEndMin - 1;
    
    if (midMin > midMax) return Math.floor(sceneMin + (totalRange/2)); 
    return Math.floor(Math.random() * (midMax - midMin + 1)) + midMin;
  };

  const startBattle = async (isBoss = false) => {
    // FIX: Clear existing enemy to prevent "double image" / ghosting
    setEnemy(null);
    
    audioService.playSfx(isBoss ? 'LOSE' : 'CONFIRM'); // Intimidating sound for boss
    setLoading(true);
    // Determine Map Background based on Tile
    const mapData = getCurrentMapData();
    let currentTile: TileType = 'G'; // Default grass
    
    if (gameState === GameState.MAP) {
         currentTile = mapData[playerPos.y][playerPos.x];
    }

    setPrevGameState(gameState);
    setGameState(GameState.BATTLE);
    setBattleState(BattleState.PLAYER_INPUT);
    setBattleLogs([]);
    setMenuIndex(0);

    // Set Background based on location/tile
    if (gameState === GameState.DUNGEON) setSelectedLocation('volcano');
    else if (currentTile === 'F') setSelectedLocation('forest');
    else if (currentTile === 'M') setSelectedLocation('mountain');
    else if (currentTile === 'C') setSelectedLocation('castle');
    else setSelectedLocation('castle'); // Default fallback for plains/grass

    const targetLevel = calculateEncounterLevel(isBoss, mapData, playerPos);

    const newEnemy = await generateDinosaur(targetLevel, lang);
    
    // Flag boss
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

  // Check random encounter on map move
  const checkRandomEncounter = (tile: TileType) => {
    // FIX: Never encounter on Special Tiles (C, V, H, K, U)
    if (tile === 'C' || tile === 'V' || tile === 'H' || tile === 'K' || tile === 'U') return false; 

    const rate = ENCOUNTER_RATES[tile];
    if (Math.random() < rate) {
       setMapMessage(t.dungeon.encounter);
       // Small delay to show message then start battle
       setTimeout(() => startBattle(false), 100);
       return true;
    }
    return false;
  };

  // Dungeon Logic
  const processExploration = (action: 'FORWARD' | 'SEARCH' | 'DEEPER' | 'SURFACE') => {
    audioService.playSfx('SELECT');

    if (action === 'DEEPER') {
        setDungeonFloor(2);
        setExploreLog(t.dungeon.floor(2));
        return;
    }
    if (action === 'SURFACE') {
        setGameState(GameState.MAP);
        if (dungeonProgress.b2Cleared && !dungeonProgress.scene2Unlocked) {
            setDungeonProgress(p => ({...p, scene2Unlocked: true}));
            setMapMessage(t.dungeon.sceneUnlocked);
            audioService.playSfx('WIN');
        }
        return;
    }

    // High encounter rate in Dungeon
    const encounterChance = action === 'FORWARD' ? 0.7 : 0.4;
    const roll = Math.random();
    
    if (roll < encounterChance) {
        // Randomly determine if it's a boss encounter if not cleared yet
        let isBoss = false;
        if (dungeonFloor === 1 && !dungeonProgress.b1Cleared && Math.random() < 0.2) isBoss = true; // 20% chance for boss on B1F if not cleared
        if (dungeonFloor === 2 && !dungeonProgress.b2Cleared && Math.random() < 0.2) isBoss = true;

        // Encounter
        setExploreLog(isBoss ? t.dungeon.bossEncounter : t.dungeon.encounter);
        setTimeout(() => startBattle(isBoss), 100);
    } else if (roll > 0.8 && action === 'SEARCH') {
        // Find Gold
        const amount = Math.floor(Math.random() * 50 * dungeonFloor) + 50;
        setPlayer(prev => ({...prev, gold: prev.gold + amount}));
        setExploreLog(t.dungeon.foundGold(amount));
        audioService.playSfx('CONFIRM');
    } else {
        // Nothing
        setExploreLog(t.dungeon.nothing);
    }
  };

  const handlePlayerAction = async (action: 'PHYSICAL' | 'MAG_ATK' | 'MAG_HEAL' | 'ITEM' | 'FLEE') => {
    if (!enemy || battleState !== BattleState.PLAYER_INPUT || loading) return;

    setBattleState(BattleState.PROCESSING);
    audioService.playSfx('SELECT');
    
    // 1. Player Turn
    let playerDamage = 0;

    switch (action) {
      case 'PHYSICAL':
        // Base damage + Equipment Bonus
        playerDamage = Math.max(1, Math.floor(Math.random() * 5) + player.level * 2 + player.equipmentAtk - enemy.defense);
        // Critical hit chance
        if (Math.random() > 0.9) playerDamage = Math.floor(playerDamage * 1.5);
        
        audioService.playSfx('ATTACK');
        // Small delay for impact sound
        setTimeout(() => audioService.playSfx('HIT'), 200);

        setEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - playerDamage) } : null);
        addLog(t.playerAttack(playerDamage));
        break;

      case 'MAG_ATK':
        if (player.mp >= 5) {
            // Magic Attack: Higher base, ignores defense mostly
            playerDamage = Math.floor(Math.random() * 10) + player.level * 4 + 10;
            audioService.playSfx('CONFIRM'); // Magic sound
            setTimeout(() => audioService.playSfx('HIT'), 300);

            setPlayer(prev => ({ ...prev, mp: prev.mp - 5 }));
            setEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - playerDamage) } : null);
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
          setPlayer(prev => ({ 
            ...prev, 
            mp: prev.mp - 3, 
            hp: Math.min(prev.maxHp, prev.hp + healAmount) 
          }));
          addLog(t.heal(healAmount));
        } else {
          audioService.playSfx('CANCEL');
          addLog(t.noMp);
          setBattleState(BattleState.PLAYER_INPUT); // Cancel turn
          return;
        }
        break;
        
      case 'ITEM':
         // Simplified: Potion only
         if (player.potions > 0) {
            audioService.playSfx('HEAL');
            setPlayer(prev => ({ 
                ...prev, 
                potions: prev.potions - 1, 
                hp: Math.min(prev.maxHp, prev.hp + 40) 
            }));
            addLog(t.itemUsed(t.cmdItem));
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
            addLog(t.runFail); // Cannot run from boss
        } else if (Math.random() > 0.4) {
          audioService.playSfx('CONFIRM');
          addLog(t.runSuccess);
          await new Promise(r => setTimeout(r, 1000));
          // Return to where we came from
          setGameState(prevGameState);
          return;
        } else {
          audioService.playSfx('CANCEL');
          addLog(t.runFail);
        }
        break;
    }

    // Check Enemy Death
    if (enemy.hp - playerDamage <= 0 && (action === 'PHYSICAL' || action === 'MAG_ATK')) {
      const expGain = enemy.maxHp * 2;
      const goldGain = enemy.attack * 5;
      
      // Calculate Loot Drops
      const lootRoll = Math.random();
      let lootMsg = "";
      
      // Calculate new state first for Auto-Save
      let newPlayer = { ...player };
      // Apply costs if magic used in the killing blow
      if (action === 'MAG_ATK') newPlayer.mp -= 5; 

      const newExp = newPlayer.exp + expGain;
      const levelUp = newExp >= newPlayer.level * 50;
      
      newPlayer.exp = newExp;
      newPlayer.gold = newPlayer.gold + goldGain;
      if (levelUp) {
          newPlayer.level += 1;
          newPlayer.maxHp += 10;
          newPlayer.maxMp += 5;
          newPlayer.hp = newPlayer.maxHp;
          newPlayer.mp = newPlayer.maxMp;
      }

      // Loot Logic
      if (lootRoll > 0.90) { // 10% Chance for Grimoire
         const grimoires = LOOT_NAMES[lang].grimoires;
         const gName = grimoires[Math.floor(Math.random() * grimoires.length)];
         const boost = 5;
         newPlayer.maxMp += boost;
         newPlayer.mp = newPlayer.maxMp;
         lootMsg = `${t.loot.found(gName)} ${t.loot.learn("Max MP", boost)}`;
      } else if (lootRoll > 0.75) { // 15% Chance for Equipment
         if (Math.random() > 0.5) {
             // Weapon
             const weapons = LOOT_NAMES[lang].weapons;
             const wName = weapons[Math.floor(Math.random() * weapons.length)];
             const boost = Math.floor(Math.random() * 3) + 1;
             newPlayer.equipmentAtk += boost;
             lootMsg = `${t.loot.found(wName)} ${t.loot.equip(t.atk, boost)}`;
         } else {
             // Armor
             const armors = LOOT_NAMES[lang].armors;
             const aName = armors[Math.floor(Math.random() * armors.length)];
             const boost = Math.floor(Math.random() * 3) + 1;
             newPlayer.equipmentDef += boost;
             lootMsg = `${t.loot.found(aName)} ${t.loot.equip(t.def, boost)}`;
         }
      } else if (lootRoll > 0.40) { // 35% Chance for Potion
          newPlayer.potions += 1;
          lootMsg = t.loot.found(t.cmdItem);
      }

      setPlayer(newPlayer); // Update State
      
      if (levelUp) {
          addLog(`Level Up! You are now level ${newPlayer.level}!`);
          setTimeout(() => audioService.playSfx('WIN'), 500);
      } else {
          audioService.playSfx('WIN');
      }

      addLog(t.win(expGain, goldGain));
      if (lootMsg) addLog(lootMsg);
      
      // Boss Cleared Logic
      if (enemy.isBoss) {
          addLog(t.dungeon.floorCleared);
          if (dungeonFloor === 1) setDungeonProgress(p => ({...p, b1Cleared: true}));
          if (dungeonFloor === 2) setDungeonProgress(p => ({...p, b2Cleared: true, scene2Unlocked: true}));
      }

      setBattleState(BattleState.VICTORY);
      
      // TRIGGER AUTO SAVE
      autoSaveGame(newPlayer);

      return; // End flow
    }

    // Delay before enemy attacks
    await new Promise(r => setTimeout(r, 1000));

    // 2. Enemy Turn
    if (enemy.hp > 0) {
      // Enemy Dmg reduced by player Defense
      const enemyDmg = Math.max(1, enemy.attack - Math.floor(player.level / 2) - player.equipmentDef);
      
      audioService.playSfx('ATTACK');
      setTimeout(() => audioService.playSfx('HIT'), 200);
      
      setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - enemyDmg) }));
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

  // Town Shop Action Logic
  const handleShopTransaction = (choice: number) => {
    // choice: 0 = Buy/Rest, 1 = Leave (Usually)
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
            setPlayer(p => ({...p, gold: p.gold - costRest, hp: p.maxHp, mp: p.maxMp}));
            setTownMessage(t.town.restored);
            success = true;
        }
    } else if (activeShop === 'WEAPON') {
        if (player.gold >= costWeapon) {
            setPlayer(p => ({...p, gold: p.gold - costWeapon, equipmentAtk: p.equipmentAtk + 3}));
            setTownMessage(t.town.bought);
            success = true;
        }
    } else if (activeShop === 'ARMOR') {
        if (player.gold >= costArmor) {
            setPlayer(p => ({...p, gold: p.gold - costArmor, equipmentDef: p.equipmentDef + 3}));
            setTownMessage(t.town.bought);
            success = true;
        }
    } else if (activeShop === 'ITEM') {
        if (player.gold >= costPotion) {
            setPlayer(p => ({...p, gold: p.gold - costPotion, potions: p.potions + 1}));
            setTownMessage(t.town.bought);
            success = true;
        }
    } else if (activeShop === 'MAGIC') {
        if (player.gold >= costMagic) {
            setPlayer(p => ({...p, gold: p.gold - costMagic, maxMp: p.maxMp + 5, mp: p.mp + 5}));
            setTownMessage(t.town.bought);
            success = true;
        }
    }

    if (success) audioService.playSfx('HEAL'); // Using Heal sound for pleasant transaction
    else {
        setTownMessage(t.town.notEnoughGold);
        audioService.playSfx('CANCEL');
    }
  };

  const switchScene = (target: SceneType) => {
      audioService.playSfx('CONFIRM');
      setCurrentScene(target);
      setPlayerPos(MAP_START_POS);
      // Fixed logic to include CAVENDISH handling
      const targetName = target === 'AVONLEA' ? t.scenes.avonlea : (target === 'CAVENDISH' ? 'Cavendish' : t.scenes.charlottetown);
      setMapMessage(t.scenes.travelTo(targetName));
  };

  const handleInput = useCallback((key: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ENTER') => {
    // Strict Input Locking when loading (e.g. generating monster)
    if (loading || showSaveMenu || showLoadMenu || notification) return;

    // Name Input Handling is separate from main logic
    if (gameState === GameState.NAME_INPUT) {
        if (key === 'ENTER') submitName();
        return;
    }

    // Basic navigation sfx for Menus
    if (gameState !== GameState.MAP && gameState !== GameState.TOWN && (key === 'UP' || key === 'DOWN')) audioService.playSfx('SELECT');

    if (gameState === GameState.TITLE) {
      if (key === 'ENTER') {
         audioService.playSfx('CONFIRM');
         setPlayerNameInput("");
         setGameState(GameState.NAME_INPUT);
      }
    } 
    else if (gameState === GameState.MAP) {
      // Map Movement Logic
      const MAP_DATA = getCurrentMapData();
      
      if (key === 'ENTER') {
          const tile = MAP_DATA[playerPos.y][playerPos.x];
          
          if (tile === 'C') {
              // Enter Town
              audioService.playSfx('CONFIRM');
              setSelectedLocation('castle');
              setGameState(GameState.TOWN);
              setTownMessage(t.town.welcome);
              setTownPlayerPos(TOWN_START_POS); // Reset town position
              setActiveShop(null);
          } else if (tile === 'V') {
              // Enter Dungeon
              audioService.playSfx('CONFIRM');
              setSelectedLocation('volcano');
              setGameState(GameState.DUNGEON);
              setDungeonFloor(1); // Always start at B1F
              setExploreLog(t.dungeon.floor(1));
              setMenuIndex(0);
          } else if (tile === 'H' || tile === 'K' || tile === 'U') {
             // Informational Interaction for Special Tiles
             // Can add dialogue here if needed, currently they are passive
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
              else setMapMessage("");

              // Fix: Do not check random encounter on C or V or Special Tiles
              if (targetTile !== 'C' && targetTile !== 'V' && targetTile !== 'H' && targetTile !== 'K' && targetTile !== 'U') {
                  checkRandomEncounter(targetTile);
              }
          }
      }
    }
    else if (gameState === GameState.TOWN) {
        // Town Logic
        if (activeShop) {
            // In a shop menu
            if (key === 'UP') setMenuIndex(prev => (prev - 1 + 2) % 2);
            if (key === 'DOWN') setMenuIndex(prev => (prev + 1) % 2);
            if (key === 'ENTER') handleShopTransaction(menuIndex);
        } else {
            // Walking in Town
            if (key === 'ENTER') {
                const tile = TOWN_MAP[townPlayerPos.y][townPlayerPos.x];
                let shop: ShopType = null;
                if (tile === 'G') shop = 'GUILD';
                else if (tile === 'W') shop = 'WEAPON';
                else if (tile === 'A') shop = 'ARMOR';
                else if (tile === 'I') shop = 'ITEM';
                else if (tile === 'M') shop = 'MAGIC';
                else if (tile === 'E') {
                    audioService.playSfx('CANCEL');
                    setGameState(GameState.MAP);
                    return;
                }

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
                if (targetTile !== '_') {
                    setTownPlayerPos({ x: newX, y: newY });
                    audioService.playSfx('SELECT');
                    
                    let msg = "";
                    if (targetTile === 'G') msg = t.town.shops.guild;
                    if (targetTile === 'W') msg = t.town.shops.weapon;
                    if (targetTile === 'A') msg = t.town.shops.armor;
                    if (targetTile === 'I') msg = t.town.shops.item;
                    if (targetTile === 'M') msg = t.town.shops.magic;
                    if (targetTile === 'E') msg = t.town.exitTown;
                    if (msg) setTownMessage(t.town.enterShop); // Generic prompt, specific name on top
                }
            }
        }
    }
    else if (gameState === GameState.DUNGEON) {
        // Dungeon Menu
        // B1: Forward, Search, (NextFloor if clear), Leave
        // B2: Forward, Search, (Surface if clear), Leave
        
        let options = ['FORWARD', 'SEARCH', 'LEAVE'];
        if (dungeonFloor === 1 && dungeonProgress.b1Cleared) options = ['FORWARD', 'SEARCH', 'DEEPER', 'LEAVE'];
        if (dungeonFloor === 2 && dungeonProgress.b2Cleared) options = ['FORWARD', 'SEARCH', 'SURFACE', 'LEAVE'];

        if (key === 'UP') setMenuIndex(prev => (prev - 1 + options.length) % options.length);
        if (key === 'DOWN') setMenuIndex(prev => (prev + 1) % options.length);
        if (key === 'ENTER') {
            const choice = options[menuIndex];
            if (choice === 'FORWARD') processExploration('FORWARD');
            if (choice === 'SEARCH') processExploration('SEARCH');
            if (choice === 'DEEPER') processExploration('DEEPER');
            if (choice === 'SURFACE') processExploration('SURFACE');
            if (choice === 'LEAVE') setGameState(GameState.MAP);
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
        if (battleState === BattleState.VICTORY) {
            // Return to previous location based on context
            // If previous state was MAP, stay in MAP. If Dungeon, stay in Dungeon.
            if (prevGameState === GameState.MAP || prevGameState === GameState.DUNGEON) {
                 setGameState(prevGameState);
            } else {
                 setGameState(GameState.MAP); // Fallback
            }
            setMenuIndex(0);
        } else {
            setPlayer(prev => {
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
  }, [gameState, menuIndex, battleState, loading, player, enemy, lang, selectedLocation, playerPos, townPlayerPos, activeShop, currentScene, dungeonFloor, dungeonProgress, showSaveMenu, showLoadMenu, playerNameInput, notification, prevGameState]);

  // Click handler for tiles
  const handleMapClick = (targetX: number, targetY: number, type: 'WORLD' | 'TOWN') => {
      // Prevent click interactions if loading
      if (loading || showSaveMenu || showLoadMenu || notification) return;

      handleUserInteraction();
      const currentPos = type === 'WORLD' ? playerPos : townPlayerPos;
      const dx = targetX - currentPos.x;
      const dy = targetY - currentPos.y;

      // If clicked adjacent or current
      if (Math.abs(dx) + Math.abs(dy) === 1) {
          if (dy === -1) handleInput('UP');
          if (dy === 1) handleInput('DOWN');
          if (dx === -1) handleInput('LEFT');
          if (dx === 1) handleInput('RIGHT');
      } else if (dx === 0 && dy === 0) {
          handleInput('ENTER');
      }
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading) return; // Prevent keyboard if loading
      // Allow typing in name input
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
                        const isAutoSave = idx === 4; // 5th slot (index 4)
                        const canSave = isSave && !isAutoSave; // Cannot manual save to auto slot
                        const canLoad = !isSave && slot; // Can only load if slot exists

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
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center animate-fade-in">
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
          {/* Realistic Badge - Click for God Mode */}
          <div 
              className="mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-bounce-slight cursor-pointer hover:scale-105 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                handleUserInteraction();
                audioService.playSfx('WIN'); // Secret sound
                setPlayer({...GOD_MODE_PLAYER});
                setGameState(GameState.MAP);
                setMapMessage(t.dungeon.title);
              }}
              title="???"
          >
             <img 
                src={TITLE_BADGE_URL} 
                alt="Turkey Quest Badge" 
                className="w-[180px] h-[180px] object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
             />
          </div>

          <h1 className="text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] font-bold tracking-widest leading-none mb-4 font-['VT323'] whitespace-nowrap">
            {t.title}
          </h1>
          <p className="text-lg md:text-2xl text-yellow-100 drop-shadow-md mb-12 tracking-wider bg-black/60 px-6 py-2 rounded-full border border-yellow-800/50">
             {lang === Language.ZH ? 'EP1：勇者與清秀佳人在愛德華王子島的冒險' : 'EP1: The Adventure of the Hero and Anne on Prince Edward Island'}
          </p>

          <div className="flex flex-col items-center gap-4 w-64">
            <RetroButton 
                onClick={() => handleInput('ENTER')} 
                active={true} 
                className="justify-center text-2xl border-2 border-yellow-500 bg-black/80 hover:bg-red-900"
            >
                {t.start}
            </RetroButton>

            <RetroButton 
                onClick={(e) => { e.stopPropagation(); setShowLoadMenu(true); audioService.playSfx('SELECT'); }} 
                className={`justify-center text-xl border-2 border-blue-500 bg-black/80 hover:bg-blue-900 relative ${!hasSaves ? 'opacity-70' : ''}`}
            >
                {hasSaves && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-400 animate-pulse text-xs">●</span>}
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
    const mapName = currentScene === 'AVONLEA' ? t.scenes.avonlea : (currentScene === 'CAVENDISH' ? 'Cavendish' : t.scenes.charlottetown);
    
    // Travel Button Availability
    const showAvonlea = currentScene === 'CHARLOTTETOWN' || currentScene === 'CAVENDISH';
    const showCharlottetown = (currentScene === 'AVONLEA' || currentScene === 'CAVENDISH') && dungeonProgress.scene2Unlocked;
    const showCavendish = (currentScene === 'AVONLEA' && dungeonProgress.b1Cleared) || currentScene === 'CHARLOTTETOWN';

    return (
    <div className="flex flex-row h-full bg-black gap-2">
      {/* Left Panel: Status */}
      <div className="w-1/4 min-w-[200px] flex flex-col gap-2">
         <RetroWindow className="flex justify-between items-center py-2 bg-slate-900 border-slate-500">
             <h2 className="text-base lg:text-xl text-yellow-300 tracking-wider flex items-center gap-2">
                 <span>🗺️</span> {t.worldMapName}
             </h2>
         </RetroWindow>
         <div className="flex-1">
            <StatusPanel player={player} t={t} onSave={undefined} />
         </div>
      </div>
      
      {/* Right Panel: Map */}
      <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden relative border-4 border-gray-700 rounded p-4 items-center justify-center">
          <span className="absolute top-2 left-2 z-10 text-xl font-bold text-yellow-300 bg-black/50 px-3 py-1 border border-yellow-600 rounded">
              {mapName}
          </span>
          <span className="absolute bottom-2 right-2 z-10 text-sm text-gray-300 animate-pulse bg-black/50 px-2 rounded">
              {mapMessage || "Navigate with Arrow Keys or Click"}
          </span>
          
          {/* Fast Travel Buttons */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
              {showCharlottetown && (
                  <button onClick={() => switchScene('CHARLOTTETOWN')} className="bg-blue-800 text-white px-3 py-1 border border-white hover:bg-blue-600 text-sm font-bold">
                      ✈ {t.scenes.charlottetown}
                  </button>
              )}
               {showCavendish && (
                  <button onClick={() => switchScene('CAVENDISH')} className="bg-purple-800 text-white px-3 py-1 border border-white hover:bg-purple-600 text-sm font-bold">
                      ✈ Cavendish
                  </button>
              )}
              {showAvonlea && (
                  <button onClick={() => switchScene('AVONLEA')} className="bg-green-800 text-white px-3 py-1 border border-white hover:bg-green-600 text-sm font-bold">
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
              {MAP_DATA.map((row, y) => (
                  row.map((tile, x) => {
                      const isPlayerHere = x === playerPos.x && y === playerPos.y;
                      return (
                          <div 
                              key={`${x}-${y}`}
                              onClick={() => handleMapClick(x, y, 'WORLD')}
                              className={`
                                relative flex items-center justify-center text-lg md:text-3xl select-none cursor-pointer hover:brightness-110
                                ${TILE_COLORS[tile]}
                                transition-colors duration-300
                              `}
                          >
                              <span className="opacity-80 scale-75 md:scale-100 drop-shadow-md">{TILE_ICONS[tile]}</span>
                              {isPlayerHere && (
                                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                      <img 
                                        src={PLAYER_SPRITE_URL} 
                                        alt="Player" 
                                        className="w-full h-full object-contain animate-bounce drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                                      />
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
    // Show Shop Menu or Town Map
    const renderRightSide = () => {
        if (activeShop) {
            // SHOP INTERIOR VIEW - NOW WITH NPC PORTRAITS
            let shopName = "";
            let npcImage = "";
            let actionText = "";

            if (activeShop === 'GUILD') { shopName = t.town.shops.guild; npcImage = SHOP_IMAGES.guild; actionText = t.town.actions.rest(20); }
            if (activeShop === 'WEAPON') { shopName = t.town.shops.weapon; npcImage = SHOP_IMAGES.weapon; actionText = t.town.actions.buyWeapon(100 * player.level); }
            if (activeShop === 'ARMOR') { shopName = t.town.shops.armor; npcImage = SHOP_IMAGES.armor; actionText = t.town.actions.buyArmor(100 * player.level); }
            if (activeShop === 'ITEM') { shopName = t.town.shops.item; npcImage = SHOP_IMAGES.item; actionText = t.town.actions.buyPotion(20); }
            if (activeShop === 'MAGIC') { shopName = t.town.shops.magic; npcImage = SHOP_IMAGES.magic; actionText = t.town.actions.buyMagic(200 * player.level); }

            return (
                <div className="flex-1 relative flex flex-col border-4 border-yellow-700 rounded overflow-hidden bg-[#2a1d15]">
                     <div className="flex-1 flex flex-col items-center justify-center p-8">
                          {/* NPC Portrait */}
                          <div className="bg-black/50 border-4 border-yellow-600 rounded-full p-2 mb-6 shadow-2xl">
                              <img 
                                src={npcImage} 
                                alt="Shop Keeper" 
                                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover bg-gray-800"
                              />
                          </div>
                          
                          <RetroWindow className="w-full max-w-lg mb-8 bg-black/80 border-yellow-500">
                                <h2 className="text-3xl text-yellow-400 text-center border-b border-gray-600 pb-2 mb-2">{shopName}</h2>
                                <p className="text-center text-white text-lg italic">"{townMessage || t.town.welcome}"</p>
                          </RetroWindow>
                          
                          <div className="w-full max-w-md space-y-4">
                              <RetroButton 
                                active={menuIndex === 0}
                                onClick={() => handleShopTransaction(0)}
                                className="bg-blue-900/90 border-blue-400 py-4 text-xl"
                              >
                                {actionText}
                              </RetroButton>
                              <RetroButton 
                                active={menuIndex === 1}
                                onClick={() => handleShopTransaction(1)}
                                className="bg-red-900/90 border-red-400 py-4 text-xl"
                              >
                                {t.town.actions.leave}
                              </RetroButton>
                          </div>
                     </div>
                </div>
            );
        } else {
            // TOWN MAP VIEW
            return (
                <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative border-4 border-slate-700 rounded p-4 items-center justify-center">
                    <span className="absolute top-2 right-2 z-10 text-sm text-gray-300 bg-black/50 px-2 rounded">
                        {townMessage || t.town.welcome}
                    </span>
                    <div 
                        className="grid gap-[1px] bg-black border-4 border-slate-500 shadow-2xl"
                        style={{ 
                            gridTemplateColumns: `repeat(${TOWN_MAP[0].length}, minmax(0, 1fr))`,
                            width: '100%',
                            maxWidth: '800px',
                            aspectRatio: `${TOWN_MAP[0].length}/${TOWN_MAP.length}`
                        }}
                    >
                        {TOWN_MAP.map((row, y) => (
                            row.map((tile, x) => {
                                const isPlayerHere = x === townPlayerPos.x && y === townPlayerPos.y;
                                return (
                                    <div 
                                        key={`${x}-${y}`}
                                        onClick={() => handleMapClick(x, y, 'TOWN')}
                                        className={`
                                            relative flex items-center justify-center text-lg md:text-3xl select-none cursor-pointer hover:brightness-110
                                            ${TILE_COLORS[tile]}
                                        `}
                                    >
                                        <span className="opacity-90 scale-75 md:scale-100 drop-shadow-md">{TILE_ICONS[tile]}</span>
                                        {isPlayerHere && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                                <img 
                                                    src={PLAYER_SPRITE_URL} 
                                                    alt="Player" 
                                                    className="w-full h-full object-contain animate-bounce drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                                                />
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
      <div className="flex flex-row h-full bg-slate-900 gap-2">
         {/* Left: Stats */}
         <div className="w-1/4 min-w-[200px]">
             <StatusPanel player={player} t={t} onSave={undefined} />
         </div>
         {/* Right: Town Map or Shop */}
         {renderRightSide()}
      </div>
    );
  };

  const renderDungeon = () => {
    // Determine menu options based on floor progress
    let options = [t.dungeon.forward, t.dungeon.search, t.dungeon.leave];
    if (dungeonFloor === 1 && dungeonProgress.b1Cleared) options = [t.dungeon.forward, t.dungeon.search, t.dungeon.goDeeper, t.dungeon.leave];
    if (dungeonFloor === 2 && dungeonProgress.b2Cleared) options = [t.dungeon.forward, t.dungeon.search, t.dungeon.returnSurface, t.dungeon.leave];

    // Simple mapper for button clicks
    const handleClick = (idx: number) => {
         const label = options[idx];
         if (label === t.dungeon.forward) processExploration('FORWARD');
         if (label === t.dungeon.search) processExploration('SEARCH');
         if (label === t.dungeon.goDeeper) processExploration('DEEPER');
         if (label === t.dungeon.returnSurface) processExploration('SURFACE');
         if (label === t.dungeon.leave) setGameState(GameState.MAP);
    }

    return (
      <div className="flex flex-row h-full bg-red-950 gap-2">
          {/* Left Panel: Status + Menu */}
          <div className="w-1/4 min-w-[220px] flex flex-col gap-2">
               <RetroWindow className="bg-red-900/50 border-red-400 flex flex-row items-center justify-center p-2 gap-4">
                    <span className="text-3xl">💀</span>
                    <h2 className="text-xl text-red-300 animate-pulse whitespace-nowrap">
                        {t.dungeon.floor(dungeonFloor)}
                    </h2>
               </RetroWindow>

               <div className="flex flex-col justify-center bg-black/40 p-2 rounded border border-red-900/50 mb-2">
                    <div className="space-y-4 w-full">
                        {options.map((opt, idx) => (
                             <RetroButton 
                                key={idx}
                                active={menuIndex === idx} 
                                onClick={(e) => { e.stopPropagation(); handleClick(idx); }}
                                onMouseEnter={() => setMenuIndex(idx)}
                                className="text-center justify-center py-2 text-lg bg-red-900/60 border-red-400"
                            >
                                {opt}
                            </RetroButton>
                        ))}
                    </div>
               </div>

               <div className="flex-1">
                 <StatusPanel player={player} t={t} onSave={undefined} />
               </div>
          </div>

          {/* Right Panel: Visuals & Log */}
          <div className="flex-1 flex flex-col relative border-4 border-red-800 rounded bg-black overflow-hidden">
              <div 
                  className="absolute inset-0 opacity-40 blur-sm"
                  style={{ backgroundImage: `url(${selectedLocation ? LOCATION_IMAGES[selectedLocation] : ''})`, backgroundSize: 'cover' }}
              ></div>
              
              <div className="z-10 flex-1 flex flex-col p-6 items-center justify-center">
                   {/* Main Log Display Area */}
                   <RetroWindow className="w-full max-w-3xl h-full flex flex-col justify-center items-center text-center bg-black/80 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                        <div className="text-3xl text-red-100 font-bold mb-4">
                            {exploreLog.split('!')[0]}...
                        </div>
                        <div className="text-xl text-gray-300">
                             {exploreLog}
                        </div>
                   </RetroWindow>
              </div>
          </div>
      </div>
    );
  };

  const getLevelColor = (level: number, isBoss: boolean) => {
      if (isBoss) return "text-red-600 animate-pulse font-extrabold shadow-white";
      
      // Calculate level range for current context to determine color
      let min = 1;
      let max = 8;
      
      if (gameState === GameState.DUNGEON) {
          min = dungeonFloor === 1 ? 5 : 8;
          max = dungeonFloor === 1 ? 9 : 10;
      } else if (currentScene === 'AVONLEA') {
          min = 1; max = 8;
      } else if (currentScene === 'CAVENDISH') {
          min = 8; max = 15;
      } else if (currentScene === 'CHARLOTTETOWN') {
          min = 12; max = 20;
      }
      
      // Safety if range is flat
      if (min === max) return "text-yellow-400";

      const range = max - min;
      const lowCap = min + (range / 3);
      const highStart = max - (range / 3);

      if (level <= lowCap) return "text-green-400 font-bold";
      if (level >= highStart) return "text-orange-500 font-bold";
      return "text-yellow-400 font-bold";
  };

  const renderBattle = () => (
    <div className="flex flex-row h-full relative gap-2 bg-black">
      {/* Left Panel: Status */}
      <div className="w-1/4 min-w-[200px] flex flex-col">
          <StatusPanel player={player} t={t} onSave={undefined} /> 
          {/* Cannot save during battle */}
      </div>

      {/* Right Panel: Scene + Actions */}
      <div className="flex-1 flex flex-col h-full gap-2">
          {/* Top: Scene */}
          <div 
            className="flex-[2] relative bg-black border-4 border-white rounded overflow-hidden flex items-center justify-center bg-cover bg-center transition-all duration-500"
            style={{ 
                backgroundImage: selectedLocation ? `url(${LOCATION_IMAGES[selectedLocation]})` : 'none',
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
            
            {loading && <div className="text-3xl animate-pulse text-white font-bold tracking-widest">{t.loading}</div>}
            
            {!loading && enemy && (
                <div className={`relative flex flex-row items-center justify-center gap-8 w-full max-w-4xl p-4 transition-opacity duration-300 ${battleState === BattleState.VICTORY ? 'opacity-40 blur-sm' : 'opacity-100'}`}>
                    {/* Monster visual */}
                    <div className="w-1/2 flex items-center justify-center animate-bounce-slight">
                        <img 
                            src={enemy.imageUrl} 
                            alt={enemy.name}
                            className={`object-contain pixelated drop-shadow-[0_0_20px_rgba(255,0,0,0.4)] ${enemy.isBoss ? 'w-64 h-64 md:w-80 md:h-80 filter saturate-150' : 'w-48 h-48 md:w-64 md:h-64'}`}
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    
                    {/* Stats Info (Detailed) */}
                    <div className="w-1/2 bg-black/80 p-6 border-2 border-white text-left rounded-lg shadow-xl backdrop-blur-md">
                        <div className={`text-2xl lg:text-3xl font-bold mb-2 tracking-widest flex items-center gap-2`}>
                            <span className={`text-base align-middle mr-1 border border-current px-1 rounded ${getLevelColor(enemy.level, !!enemy.isBoss)}`}>Lv.{enemy.level}</span>
                            <span className="text-red-400">{enemy.name}</span>
                        </div>
                        <div className="text-base lg:text-lg text-gray-300 italic mb-4 font-serif leading-snug">{enemy.description}</div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-lg mb-4 font-mono">
                            <div className="text-green-400">HP: {enemy.hp.toLocaleString()} / {enemy.maxHp.toLocaleString()}</div>
                            <div className="text-blue-400">MP: {enemy.mp?.toLocaleString() || '??'}</div>
                            <div className="text-red-400">ATK: {enemy.attack.toLocaleString()}</div>
                            <div className="text-yellow-400">DEF: {enemy.defense?.toLocaleString() || '??'}</div>
                        </div>

                        <div className="w-full bg-gray-800 h-6 rounded-full overflow-hidden border border-gray-600">
                            <div 
                                className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500 shadow-[0_0_10px_red]" 
                                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Victory/Defeat Overlay */}
            {(battleState === BattleState.VICTORY || battleState === BattleState.DEFEAT) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                    <div className={`text-6xl md:text-8xl font-bold mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(0,0,0,1)] ${battleState === BattleState.VICTORY ? 'text-yellow-400' : 'text-red-700 font-["Nosifer"]'}`}>
                        {battleState === BattleState.VICTORY ? 
                           (enemy?.isBoss ? (lang === Language.ZH ? '大獲全勝！' : 'GLORIOUS VICTORY!') : (lang === Language.ZH ? '勝利！' : 'VICTORY!')) 
                           : (lang === Language.ZH ? '全軍覆沒...' : 'DEFEAT...')}
                    </div>
                    <div className="bg-blue-900/90 border-2 border-white px-8 py-4 text-xl md:text-2xl animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.6)] rounded-lg">
                        {lang === Language.ZH ? '點擊任意處繼續 ▶' : 'Click Anywhere to Continue ▶'}
                    </div>
                </div>
            )}
          </div>

          {/* Bottom: Logs & Commands */}
          <div className="flex-1 flex gap-2 min-h-[160px]">
             {/* Command Menu */}
             <RetroWindow className="w-1/3 flex flex-col justify-center space-y-1">
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
                        className={`${battleState !== BattleState.PLAYER_INPUT ? 'opacity-50' : ''} text-lg py-1`}
                    >
                        {action === 'PHYSICAL' ? t.cmdPhysical : 
                        action === 'MAG_ATK' ? t.cmdMagAtk : 
                        action === 'MAG_HEAL' ? t.cmdMagHeal : 
                        action === 'ITEM' ? t.cmdItem : t.cmdFlee}
                    </RetroButton>
                ))}
             </RetroWindow>

             {/* Message Log */}
             <RetroWindow className="flex-1 overflow-hidden flex flex-col bg-blue-900/90" title="ADVENTURE LOG">
                <div className="flex-1 overflow-y-auto font-mono text-base leading-relaxed space-y-1 p-2" ref={scrollRef}>
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
      
      {/* Floating Save Button (Top Right) */}
      {(gameState === GameState.MAP || gameState === GameState.TOWN || gameState === GameState.DUNGEON) && (
          <div className="fixed top-6 right-24 z-[100] flex gap-2">
            <button 
              onClick={handleReturnToTitle}
              className="bg-red-800 border-2 border-red-400 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-700 active:scale-95 flex items-center gap-2"
              title={t.saveLoad.returnTitle}
            >
                🏠 <span className="hidden md:inline">{t.saveLoad.returnTitle}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSaveMenu(true); audioService.playSfx('SELECT'); }}
              className="bg-green-800 border-2 border-green-400 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-green-700 active:scale-95 flex items-center gap-2"
              title={t.saveLoad.saveBtn}
            >
                💾 <span className="hidden md:inline">{t.saveLoad.saveBtn}</span>
            </button>
          </div>
      )}

      {/* Sound Toggle */}
      <button 
        onClick={toggleMute}
        className="fixed top-6 right-6 z-[100] bg-gray-800 border-2 border-white text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-gray-700 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
            <span className="text-3xl filter grayscale opacity-50">🔇</span>
        ) : (
            <span className="text-3xl">🔊</span>
        )}
      </button>

      {/* Save/Load Overlay */}
      {(showSaveMenu || showLoadMenu) && renderSaveLoadMenu()}
      
      {/* Auto Save Notification */}
      {notification && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80">
              <div className="bg-blue-900 border-2 border-white px-8 py-4 text-xl text-yellow-300 animate-pulse shadow-xl rounded">
                  {notification}
              </div>
          </div>
      )}
      
      {/* Main Game Container */}
      <div className="w-full max-w-[1280px] max-h-[100dvh] aspect-video bg-gray-900 relative shadow-2xl flex flex-col border-0 md:border-[12px] border-gray-700 rounded-xl overflow-hidden box-border">
        {/* Screen Content */}
        <div className="flex-1 p-0 md:p-6 bg-[#0a0a0a] relative flex flex-col">
            {gameState === GameState.TITLE && renderTitle()}
            {gameState === GameState.NAME_INPUT && renderNameInput()}
            {gameState === GameState.MAP && renderWorldMap()}
            {gameState === GameState.TOWN && renderTown()}
            {gameState === GameState.DUNGEON && renderDungeon()}
            {gameState === GameState.BATTLE && renderBattle()}
        </div>
      </div>

      {/* Controls */}
      <VirtualPad 
        onUp={() => handleInput('UP')}
        onDown={() => handleInput('DOWN')}
        onSelect={() => handleInput('ENTER')}
      />
      
      {/* Map Virtual Controls */}
      {(gameState === GameState.MAP || (gameState === GameState.TOWN && !activeShop)) && (
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

// Sub-component for cleanliness
const StatusPanel = ({ player, t, onSave }: { player: Player, t: Translation, onSave?: () => void }) => {
    // Current Level Max Exp Calculation (approx)
    const nextLevelExp = player.level * 50; 

    return (
    <RetroWindow title={player.name} className="h-full bg-blue-900/80 flex flex-col">
        <div className="space-y-3 text-2xl font-bold tracking-wide flex-1">
            {/* Improved Level Display Row */}
            <div className="flex items-center gap-2 border-b border-blue-700 pb-1 text-lg">
                <span className="text-yellow-400 whitespace-nowrap">{t.lvl} {player.level}</span>
                <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-500 relative">
                        <div 
                            className="bg-purple-500 h-full" 
                            style={{ width: `${Math.min(100, (player.exp / nextLevelExp) * 100)}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-gray-400">{player.exp}/{nextLevelExp}</span>
                </div>
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between text-base text-gray-300">
                    <span>{t.hp}</span>
                    <span>{player.hp.toLocaleString()}/{player.maxHp.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden border border-gray-500">
                    <div className="bg-gradient-to-r from-green-600 to-green-400 h-full" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}></div>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-base text-gray-300">
                    <span>{t.mp}</span>
                    <span>{player.mp.toLocaleString()}/{player.maxMp.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden border border-gray-500">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full" style={{ width: `${(player.mp / player.maxMp) * 100}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-700 text-lg">
                <div className="text-red-300">{t.atk}: {(Math.floor(player.level * 2) + player.equipmentAtk).toLocaleString()}</div>
                <div className="text-blue-300">{t.def}: {(Math.floor(player.level / 2) + player.equipmentDef).toLocaleString()}</div>
            </div>

             {/* Inventory & Equips */}
             <div className="mt-2 pt-2 border-t border-blue-700 space-y-1 text-base">
                <div className="flex justify-between text-orange-300">
                     <span>⚔️ {t.atk} +{player.equipmentAtk.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                     <span>🛡️ {t.def} +{player.equipmentDef.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                     <span>{t.potions}: {player.potions.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-4 pt-2 border-t border-blue-700 text-lg text-yellow-200">
                💰 {player.gold.toLocaleString()} G
            </div>
        </div>
    </RetroWindow>
    );
};

export default App;
