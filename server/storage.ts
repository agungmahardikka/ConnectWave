import { 
  users, 
  type User, 
  type InsertUser, 
  type Phrase,
  type InsertPhrase,
  type CallLog,
  type InsertCallLog,
  type UpdateCallLog,
  type CallMessage,
  type InsertCallMessage
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Phrases methods
  getPhrasesByUserId(userId: number): Promise<Phrase[]>;
  createPhrase(phrase: InsertPhrase): Promise<Phrase>;
  deletePhrase(id: number): Promise<void>;
  
  // Call logs methods
  getCallLogsByUserId(userId: number): Promise<CallLog[]>;
  getCallLog(id: number): Promise<CallLog | undefined>;
  createCallLog(callLog: InsertCallLog): Promise<CallLog>;
  updateCallLog(id: number, updateData: UpdateCallLog): Promise<CallLog | undefined>;
  
  // Call messages methods
  getCallMessages(callId: number): Promise<CallMessage[]>;
  createCallMessage(message: InsertCallMessage): Promise<CallMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private phrases: Map<number, Phrase>;
  private callLogs: Map<number, CallLog>;
  private callMessages: Map<number, CallMessage>;
  
  private userIdCounter: number;
  private phraseIdCounter: number;
  private callLogIdCounter: number;
  private callMessageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.phrases = new Map();
    this.callLogs = new Map();
    this.callMessages = new Map();
    
    this.userIdCounter = 1;
    this.phraseIdCounter = 1;
    this.callLogIdCounter = 1;
    this.callMessageIdCounter = 1;
    
    // Add a default user for testing
    this.createUser({ username: 'user', password: 'password' });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Phrase methods
  async getPhrasesByUserId(userId: number): Promise<Phrase[]> {
    return Array.from(this.phrases.values()).filter(
      (phrase) => phrase.userId === userId
    );
  }
  
  async createPhrase(phraseData: InsertPhrase): Promise<Phrase> {
    const id = this.phraseIdCounter++;
    const phrase: Phrase = { ...phraseData, id };
    this.phrases.set(id, phrase);
    return phrase;
  }
  
  async deletePhrase(id: number): Promise<void> {
    this.phrases.delete(id);
  }
  
  // Call log methods
  async getCallLogsByUserId(userId: number): Promise<CallLog[]> {
    return Array.from(this.callLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => {
        // Sort by start time, most recent first
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });
  }
  
  async getCallLog(id: number): Promise<CallLog | undefined> {
    return this.callLogs.get(id);
  }
  
  async createCallLog(callLogData: InsertCallLog): Promise<CallLog> {
    const id = this.callLogIdCounter++;
    const callLog: CallLog = { 
      ...callLogData, 
      id, 
      startTime: new Date(),
      endTime: null,
      duration: null,
      hasRecording: false,
      recordingPath: null
    };
    this.callLogs.set(id, callLog);
    return callLog;
  }
  
  async updateCallLog(id: number, updateData: UpdateCallLog): Promise<CallLog | undefined> {
    const callLog = this.callLogs.get(id);
    
    if (!callLog) {
      return undefined;
    }
    
    const updatedCallLog: CallLog = { ...callLog, ...updateData };
    this.callLogs.set(id, updatedCallLog);
    
    return updatedCallLog;
  }
  
  // Call message methods
  async getCallMessages(callId: number): Promise<CallMessage[]> {
    return Array.from(this.callMessages.values())
      .filter(message => message.callId === callId)
      .sort((a, b) => {
        // Sort by timestamp
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
  }
  
  async createCallMessage(messageData: InsertCallMessage): Promise<CallMessage> {
    const id = this.callMessageIdCounter++;
    const callMessage: CallMessage = {
      ...messageData,
      id,
      timestamp: new Date(),
      method: messageData.method || null // Ensure method is always string or null
    };
    this.callMessages.set(id, callMessage);
    return callMessage;
  }
  
  // Add some demo data
  populateDemoData() {
    // Demo call logs
    const callLog1: CallLog = {
      id: this.callLogIdCounter++,
      userId: 1,
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      endTime: new Date(Date.now() - 3540000), // 59 mins ago (1 min call)
      duration: 60, // 1 minute
      mode: 'deaf',
      hasRecording: true,
      recordingPath: '/recordings/call-1.mp3',
      language: 'en'
    };
    
    const callLog2: CallLog = {
      id: this.callLogIdCounter++,
      userId: 1,
      startTime: new Date(Date.now() - 86400000), // 1 day ago
      endTime: new Date(Date.now() - 86100000), // 23:55 ago (5 min call)
      duration: 300, // 5 minutes
      mode: 'both',
      hasRecording: true,
      recordingPath: '/recordings/call-2.mp3',
      language: 'hi'
    };
    
    this.callLogs.set(callLog1.id, callLog1);
    this.callLogs.set(callLog2.id, callLog2);
    
    // Demo call messages for call 1
    const messages1 = [
      {
        id: this.callMessageIdCounter++,
        callId: callLog1.id,
        text: "Hello, how can I help you today?",
        sender: "user",
        timestamp: new Date(callLog1.startTime.getTime() + 5000),
        method: "text"
      },
      {
        id: this.callMessageIdCounter++,
        callId: callLog1.id,
        text: "I'm having trouble with my internet connection",
        sender: "caller",
        timestamp: new Date(callLog1.startTime.getTime() + 15000),
        method: null
      },
      {
        id: this.callMessageIdCounter++,
        callId: callLog1.id,
        text: "I understand. Let me check that for you.",
        sender: "user",
        timestamp: new Date(callLog1.startTime.getTime() + 25000),
        method: "voice"
      }
    ];
    
    messages1.forEach(msg => {
      this.callMessages.set(msg.id, msg as CallMessage);
    });
    
    // Demo phrases
    const phrases = [
      {
        id: this.phraseIdCounter++,
        userId: 1,
        text: "Hello, how may I assist you?",
        category: "greetings"
      },
      {
        id: this.phraseIdCounter++,
        userId: 1,
        text: "Could you please repeat that?",
        category: "questions"
      },
      {
        id: this.phraseIdCounter++,
        userId: 1,
        text: "Thank you for your patience",
        category: "responses"
      }
    ];
    
    phrases.forEach(phrase => {
      this.phrases.set(phrase.id, phrase as Phrase);
    });
  }
}

export const storage = new MemStorage();
// Populate with demo data
storage.populateDemoData();
