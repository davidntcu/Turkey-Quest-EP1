
export enum Language {
  EN = 'EN',
  ZH = 'ZH'
}

export enum GameState {
  TITLE = 'TITLE',
  NAME_INPUT = 'NAME_INPUT', 
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
  avonlea: { b1: boolean; b2: boolean };
  cavendish: { b1: boolean; b2: boolean };
  charlottetown: { b1: boolean; b2: boolean };
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
  reincarnationCount: number;
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
  dungeonPlayerPos?: { x: number; y: number };
  dungeonProgress: DungeonProgress;
  timestamp: number;
  locationLabel: string;
}

export interface TownNPC {
  id: number;
  x: number;
  y: number;
  avatarSeed: string;
  name: string;
  dialogue: string;
  reward?: {
      type: 'GOLD' | 'POTION' | 'MAXHP' | 'MAXMP';
      value: number;
  };
  rewardClaimed: boolean;
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
  reincarnationLabel: string;
  about: {
    title: string;
    plot: string;
    gameplay: string;
    author: string;
    email: string;
    close: string;
  };
  naming: {
    title: string;
    placeholder: string;
    hint: string;
    confirm: string;
    defaultName: string;
  };
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
  itemUsed: () => string;
  noItem: string;
  noMp: string;
  locations: {
    forest: string;
    mountain: string;
    volcano: string;
    castle: string;
  };
  mapActions: {
    enterTown: string;
    enterDungeon: string;
  };
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
    reincarnationMsg: (count: number) => string;
  };
  reincarnationModal: {
    title: string;
    message: (nextRank: number) => string;
    bonus: string;
    confirm: string;
  };
  scenes: {
    avonlea: string;
    charlottetown: string;
    cavendish: string;
    travelTo: (place: string) => string;
    locked: string;
  };
  facilityHints: {
    house: string;
    school: string;
    academy: string;
  };
}

export type TileType = 'W' | 'G' | 'F' | 'M' | 'V' | 'C' | 'H' | 'K' | 'U';
// R: Road, T: Tree, N: House, g: Guild, w: Weapon, a: Armor, i: Item, m: Magic, E: Exit
export type TownTileType = '_' | 'R' | 'T' | 'N' | 'g' | 'w' | 'a' | 'i' | 'm' | 'E';
// f: Floor, d: Wall (Dark), S: Stairs(Up/Down), E: Exit/Teleport, B: Boss
export type DungeonTileType = '_' | 'f' | 'd' | 'S' | 'E' | 'B';
