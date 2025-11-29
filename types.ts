

export enum Language {
  EN = 'EN',
  ZH = 'ZH'
}

export enum GameState {
  TITLE = 'TITLE',
  NAME_INPUT = 'NAME_INPUT', // New State
  MAP = 'MAP',
  TOWN = 'TOWN',
  DUNGEON = 'DUNGEON',
  BATTLE = 'BATTLE',
  GAME_OVER = 'GAME_OVER'
}

export enum BattleState {
  PLAYER_INPUT = 'PLAYER_INPUT',
  PROCESSING = 'PROCESSING',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

export type ShopType = 'GUILD' | 'WEAPON' | 'ARMOR' | 'ITEM' | 'MAGIC' | null;

export type SceneType = 'AVONLEA' | 'CAVENDISH' | 'CHARLOTTETOWN';

export interface DungeonProgress {
  b1Cleared: boolean;
  b2Cleared: boolean;
  scene2Unlocked: boolean;
}

export interface Player {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  gold: number;
  potions: number;
  equipmentAtk: number;
  equipmentDef: number;
}

export interface Enemy {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  description: string;
  imageUrl?: string;
  isBoss?: boolean;
}

export interface SaveData {
  player: Player;
  currentScene: SceneType;
  playerPos: { x: number; y: number };
  townPlayerPos: { x: number; y: number };
  dungeonFloor: number;
  dungeonProgress: DungeonProgress;
  timestamp: number;
  locationLabel: string;
}

export interface Translation {
  worldMapName: string;
  loading: string;
  title: string;
  start: string;
  continue: string;
  credits: string;
  hp: string;
  mp: string;
  lvl: string;
  atk: string;
  def: string;
  potions: string;
  // Naming Screen
  naming: {
    title: string;
    placeholder: string;
    hint: string;
    confirm: string;
    defaultName: string;
  };
  // Save/Load
  saveLoad: {
    saveTitle: string;
    loadTitle: string;
    emptySlot: string;
    saveBtn: string;
    backBtn: string;
    savedMsg: string;
    loadedMsg: string;
    autoSave: string;
    autoSavedLog: string;
    returnTitle: string;
    returningMsg: string;
  };
  // Battle Commands
  cmdPhysical: string;
  cmdMagAtk: string;
  cmdMagHeal: string;
  cmdItem: string;
  cmdFlee: string;
  
  enemyAppears: (name: string) => string;
  playerAttack: (damage: number) => string;
  playerMagAtk: (damage: number) => string;
  enemyAttack: (name: string, damage: number) => string;
  win: (exp: number, gold: number) => string;
  loot: {
    found: (item: string) => string;
    equip: (stat: string, val: number) => string;
    learn: (stat: string, val: number) => string;
  };
  lose: string;
  runSuccess: string;
  runFail: string;
  heal: (amount: number) => string;
  itemUsed: (name: string) => string;
  noItem: string;
  noMp: string;
  locations: {
    forest: string;
    mountain: string;
    volcano: string;
    castle: string;
  };
  // Map Interactions
  mapActions: {
    enterTown: string;
    enterDungeon: string;
  };
  // Town & Shops
  town: {
    welcome: string;
    enterShop: string;
    exitTown: string;
    shops: {
      guild: string;
      weapon: string;
      armor: string;
      item: string;
      magic: string;
    };
    actions: {
      rest: (cost: number) => string;
      buyWeapon: (cost: number) => string;
      buyArmor: (cost: number) => string;
      buyPotion: (cost: number) => string;
      buyMagic: (cost: number) => string;
      leave: string;
    };
    notEnoughGold: string;
    restored: string;
    bought: string;
  };
  // Dungeon Actions
  dungeon: {
    title: string;
    floor: (f: number) => string;
    forward: string;
    goDeeper: string;
    returnSurface: string;
    search: string;
    leave: string;
    nothing: string;
    foundGold: (amount: number) => string;
    encounter: string;
    bossEncounter: string;
    floorCleared: string;
    sceneUnlocked: string;
  };
  scenes: {
    avonlea: string;
    charlottetown: string;
    travelTo: (place: string) => string;
  }
}

export type TileType = 'W' | 'G' | 'F' | 'M' | 'V' | 'C' | 'H' | 'K' | 'U';
export type TownTileType = '_' | 'S' | 'G' | 'W' | 'A' | 'I' | 'M' | 'E';